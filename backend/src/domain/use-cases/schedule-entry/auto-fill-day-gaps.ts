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
  formatDateToISO,
  getMondayOfWeek,
  getSundayOfWeek,
} from '@/domain/utils/schedule'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
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

export type DayGapReport = {
  hasGaps: boolean
  professionGaps: ProfessionGap[]
}

interface Payload {
  entryId: string
}

interface Response {
  item: ScheduleEntry
  gapReport: DayGapReport
}

export class AutoFillDayGapsUseCase implements UseCase<Response> {
  constructor(
    private scheduleEntryRepository: ScheduleEntryRepository,
    private teamMemberRepository: TeamMemberRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const entry = await this.scheduleEntryRepository.findById(payload.entryId)

    if (!entry) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'SCHEDULE_ENTRY_NOT_FOUND',
        variables: [payload.entryId],
      })
    }

    const structure = entry.props.structure.value

    if (structure.length === 0) {
      return {
        item: entry,
        gapReport: { hasGaps: false, professionGaps: [] },
      }
    }

    const allTeamMembers = await this.teamMemberRepository.findAll()

    const entryDate = new Date(`${entry.props.date}T00:00:00Z`)
    const weekStart = formatDateToISO(getMondayOfWeek(entryDate))
    const weekEnd = formatDateToISO(getSundayOfWeek(entryDate))

    const weekEntries = await this.scheduleEntryRepository.findByDateRange(
      weekStart,
      weekEnd,
    )

    const assignmentCounts = new Map<string, number>()
    for (const tm of allTeamMembers) {
      assignmentCounts.set(tm.id, 0)
    }

    for (const weekEntry of weekEntries) {
      for (const mapItem of weekEntry.props.teamMembers.getItems()) {
        assignmentCounts.set(
          mapItem.props.teamMemberId,
          (assignmentCounts.get(mapItem.props.teamMemberId) ?? 0) + 1,
        )
      }
    }

    const alreadyAssigned = new Set(
      entry.props.teamMembers.getItems().map((item) => item.props.teamMemberId),
    )

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

    const professionGaps: ProfessionGap[] = []
    const newlyAssigned = new Set<string>()

    for (const profReq of structure) {
      const sortedSpecReqs = [...profReq.specialtyRequirements].sort((a, b) => {
        const aCount =
          byProfessionSpecialty.get(`${profReq.profession}:${a.specialty}`)
            ?.length ?? 0
        const bCount =
          byProfessionSpecialty.get(`${profReq.profession}:${b.specialty}`)
            ?.length ?? 0
        return aCount - bCount
      })

      const specialtyGaps: SpecialtyGap[] = []

      for (const specReq of sortedSpecReqs) {
        const key = `${profReq.profession}:${specReq.specialty}`
        const assignedForSpecialty = (
          byProfessionSpecialty.get(key) ?? []
        ).filter(
          (tm) => alreadyAssigned.has(tm.id) || newlyAssigned.has(tm.id),
        ).length

        const remaining = specReq.requiredCount - assignedForSpecialty

        if (remaining > 0) {
          const eligible = (byProfessionSpecialty.get(key) ?? [])
            .filter(
              (tm) => !alreadyAssigned.has(tm.id) && !newlyAssigned.has(tm.id),
            )
            .sort(
              (a, b) =>
                (assignmentCounts.get(a.id) ?? 0) -
                  (assignmentCounts.get(b.id) ?? 0) || a.id.localeCompare(b.id),
            )

          const toAssign = eligible.slice(0, remaining)
          for (const tm of toAssign) {
            newlyAssigned.add(tm.id)
            assignmentCounts.set(tm.id, (assignmentCounts.get(tm.id) ?? 0) + 1)
          }

          const totalAssignedForSpecialty =
            assignedForSpecialty + toAssign.length
          if (totalAssignedForSpecialty < specReq.requiredCount) {
            specialtyGaps.push({
              specialty: specReq.specialty,
              requiredCount: specReq.requiredCount,
              assignedCount: totalAssignedForSpecialty,
              deficit: specReq.requiredCount - totalAssignedForSpecialty,
            })
          }
        }
      }

      const totalAssignedForProfession = (
        byProfession.get(profReq.profession) ?? []
      ).filter(
        (tm) => alreadyAssigned.has(tm.id) || newlyAssigned.has(tm.id),
      ).length

      const remainingToFill = profReq.requiredCount - totalAssignedForProfession

      let actualTotal = totalAssignedForProfession

      if (remainingToFill > 0) {
        const eligible = (byProfession.get(profReq.profession) ?? [])
          .filter(
            (tm) => !alreadyAssigned.has(tm.id) && !newlyAssigned.has(tm.id),
          )
          .sort(
            (a, b) =>
              (assignmentCounts.get(a.id) ?? 0) -
                (assignmentCounts.get(b.id) ?? 0) || a.id.localeCompare(b.id),
          )

        const toAssign = eligible.slice(0, remainingToFill)
        for (const tm of toAssign) {
          newlyAssigned.add(tm.id)
          assignmentCounts.set(tm.id, (assignmentCounts.get(tm.id) ?? 0) + 1)
        }

        actualTotal = totalAssignedForProfession + toAssign.length
      }

      if (actualTotal < profReq.requiredCount || specialtyGaps.length > 0) {
        professionGaps.push({
          profession: profReq.profession,
          requiredCount: profReq.requiredCount,
          assignedCount: actualTotal,
          deficit: Math.max(0, profReq.requiredCount - actualTotal),
          specialtyGaps,
        })
      }
    }

    for (const teamMemberId of newlyAssigned) {
      entry.props.teamMembers.add(
        ScheduleEntryTeamMemberMap.create({
          scheduleEntryId: entry.id,
          teamMemberId,
        }),
      )
    }

    const updatedEntry = await this.scheduleEntryRepository.update(entry.id, {
      structure: entry.props.structure,
      teamMembers: entry.props.teamMembers,
    })

    return {
      item: updatedEntry,
      gapReport: {
        hasGaps: professionGaps.length > 0,
        professionGaps,
      },
    }
  }
}
