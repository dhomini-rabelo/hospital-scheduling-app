import { ScheduleEntryRepository } from '@/adapters/repositories/schedule-entry-repository'
import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import { ScheduleEntry } from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryTeamMemberMap } from '@/domain/entities/schedule-entry/schedule-entry-team-member-map'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import {
  getWeekDates,
  validateDatesInViewRange,
  validateIsMonday,
} from '@/domain/utils/schedule'
import { UseCase } from '@/modules/domain/use-case'

type SpecialtyGap = {
  specialty: Specialty
  requiredCount: number
  assignedCount: number
  deficit: number
}

type ProfessionGap = {
  profession: Profession
  requiredCount: number
  assignedCount: number
  deficit: number
  specialtyGaps: SpecialtyGap[]
}

type DayGap = {
  date: string
  professionGaps: ProfessionGap[]
}

export type AutoFillGapReport = {
  hasGaps: boolean
  days: DayGap[]
}

interface Payload {
  weekStartDate: string
}

interface Response {
  items: ScheduleEntry[]
  gapReport: AutoFillGapReport
}

export class AutoFillScheduleUseCase implements UseCase<Response> {
  constructor(
    private scheduleEntryRepository: ScheduleEntryRepository,
    private teamMemberRepository: TeamMemberRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    validateIsMonday(payload.weekStartDate)
    const weekDates = getWeekDates(payload.weekStartDate)
    validateDatesInViewRange(weekDates)

    const weekEndDate = weekDates[weekDates.length - 1]
    const existingEntries = await this.scheduleEntryRepository.findByDateRange(
      payload.weekStartDate,
      weekEndDate,
    )

    const allTeamMembers = await this.teamMemberRepository.findAll()

    const entriesByDate = new Map<string, ScheduleEntry>()
    for (const entry of existingEntries) {
      entriesByDate.set(entry.props.date, entry)
    }

    const { dailyAssignments, gapReport } = this.runFairDistribution(
      entriesByDate,
      allTeamMembers,
    )

    const items: ScheduleEntry[] = []

    for (const entry of existingEntries) {
      const assignedMemberIds =
        dailyAssignments.get(entry.props.date) ?? new Set<string>()

      const teamMemberMapEntities = Array.from(assignedMemberIds).map(
        (teamMemberId) =>
          ScheduleEntryTeamMemberMap.create({
            scheduleEntryId: entry.id,
            teamMemberId,
          }),
      )

      entry.props.teamMembers.update(teamMemberMapEntities)

      const updatedEntry = await this.scheduleEntryRepository.update(entry.id, {
        structure: entry.props.structure,
        teamMembers: entry.props.teamMembers,
      })

      items.push(updatedEntry)
    }

    return { items, gapReport }
  }

  private runFairDistribution(
    entriesByDate: Map<string, ScheduleEntry>,
    allTeamMembers: TeamMember[],
  ): {
    dailyAssignments: Map<string, Set<string>>
    gapReport: AutoFillGapReport
  } {
    const assignmentCounts = new Map<string, number>()
    for (const tm of allTeamMembers) {
      assignmentCounts.set(tm.id, 0)
    }

    const byProfession = new Map<Profession, TeamMember[]>()
    const byProfessionSpecialty = new Map<string, TeamMember[]>()

    for (const tm of allTeamMembers) {
      const profList = byProfession.get(tm.props.profession) ?? []
      profList.push(tm)
      byProfession.set(tm.props.profession, profList)

      const key = `${tm.props.profession}:${tm.props.specialty}`
      const specList = byProfessionSpecialty.get(key) ?? []
      specList.push(tm)
      byProfessionSpecialty.set(key, specList)
    }

    const dailyAssignments = new Map<string, Set<string>>()
    const gapDays: DayGap[] = []

    const sortedDates = Array.from(entriesByDate.keys()).sort()

    for (const date of sortedDates) {
      const entry = entriesByDate.get(date)!
      const structure = entry.props.structure.value

      if (structure.length === 0) continue

      const assigned = new Set<string>()
      const dayGaps: ProfessionGap[] = []

      for (const profReq of structure) {
        const sortedSpecReqs = [...profReq.specialtyRequirements].sort(
          (a, b) => {
            const aCount =
              byProfessionSpecialty.get(`${profReq.profession}:${a.specialty}`)
                ?.length ?? 0
            const bCount =
              byProfessionSpecialty.get(`${profReq.profession}:${b.specialty}`)
                ?.length ?? 0
            return aCount - bCount
          },
        )

        const specialtyGaps: SpecialtyGap[] = []

        for (const specReq of sortedSpecReqs) {
          const key = `${profReq.profession}:${specReq.specialty}`
          const eligible = (byProfessionSpecialty.get(key) ?? [])
            .filter((tm) => !assigned.has(tm.id))
            .sort(
              (a, b) =>
                (assignmentCounts.get(a.id) ?? 0) -
                  (assignmentCounts.get(b.id) ?? 0) || a.id.localeCompare(b.id),
            )

          const toAssign = eligible.slice(0, specReq.requiredCount)
          for (const tm of toAssign) {
            assigned.add(tm.id)
            assignmentCounts.set(tm.id, (assignmentCounts.get(tm.id) ?? 0) + 1)
          }

          if (toAssign.length < specReq.requiredCount) {
            specialtyGaps.push({
              specialty: specReq.specialty,
              requiredCount: specReq.requiredCount,
              assignedCount: toAssign.length,
              deficit: specReq.requiredCount - toAssign.length,
            })
          }
        }

        const professionAssigned = (
          byProfession.get(profReq.profession) ?? []
        ).filter((tm) => assigned.has(tm.id)).length

        const remainingToFill = profReq.requiredCount - professionAssigned

        let actualTotal = professionAssigned

        if (remainingToFill > 0) {
          const eligible = (byProfession.get(profReq.profession) ?? [])
            .filter((tm) => !assigned.has(tm.id))
            .sort(
              (a, b) =>
                (assignmentCounts.get(a.id) ?? 0) -
                  (assignmentCounts.get(b.id) ?? 0) || a.id.localeCompare(b.id),
            )

          const toAssign = eligible.slice(0, remainingToFill)
          for (const tm of toAssign) {
            assigned.add(tm.id)
            assignmentCounts.set(tm.id, (assignmentCounts.get(tm.id) ?? 0) + 1)
          }

          actualTotal = professionAssigned + toAssign.length
        }

        if (actualTotal < profReq.requiredCount || specialtyGaps.length > 0) {
          dayGaps.push({
            profession: profReq.profession,
            requiredCount: profReq.requiredCount,
            assignedCount: actualTotal,
            deficit: Math.max(0, profReq.requiredCount - actualTotal),
            specialtyGaps,
          })
        }
      }

      dailyAssignments.set(date, assigned)

      if (dayGaps.length > 0) {
        gapDays.push({ date, professionGaps: dayGaps })
      }
    }

    return {
      dailyAssignments,
      gapReport: {
        hasGaps: gapDays.length > 0,
        days: gapDays,
      },
    }
  }
}
