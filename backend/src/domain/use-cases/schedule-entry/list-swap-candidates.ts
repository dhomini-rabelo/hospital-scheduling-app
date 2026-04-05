import { ScheduleEntryRepository } from '@/adapters/repositories/schedule-entry-repository'
import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import {
  determineIsSpecialtySlot,
  validateTeamMemberIsAssignedToEntry,
} from '@/domain/use-cases/utils/schedule-entry'
import {
  formatDateToISO,
  getMondayOfWeek,
  getSundayOfWeek,
} from '@/domain/utils/schedule'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  entryId: string
  teamMemberId: string
}

type SwapCandidate = {
  teamMember: TeamMember
  weekAssignmentCount: number
}

interface Response {
  swapContext: {
    profession: Profession
    specialty: Specialty | null
  }
  candidates: SwapCandidate[]
}

export class ListSwapCandidatesUseCase implements UseCase<Response> {
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

    validateTeamMemberIsAssignedToEntry(entry, payload.teamMemberId)

    const targetMember = await this.teamMemberRepository.findById(
      payload.teamMemberId,
    )

    if (!targetMember) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'TEAM_MEMBER_NOT_FOUND',
        variables: [payload.teamMemberId],
      })
    }

    const allProfessionMembers = await this.teamMemberRepository.findAll(
      targetMember.props.profession,
    )

    const assignedTeamMemberIds = entry.props.teamMembers
      .getItems()
      .map((item) => item.props.teamMemberId)

    const isSpecialtySlot = determineIsSpecialtySlot(
      entry.props.structure.value,
      assignedTeamMemberIds,
      allProfessionMembers,
      targetMember,
    )

    let eligibleMembers = allProfessionMembers.filter(
      (tm) => !assignedTeamMemberIds.includes(tm.id),
    )

    if (isSpecialtySlot) {
      eligibleMembers = eligibleMembers.filter(
        (tm) => tm.props.specialty === targetMember.props.specialty,
      )
    }

    const entryDate = new Date(`${entry.props.date}T00:00:00Z`)
    const weekStart = formatDateToISO(getMondayOfWeek(entryDate))
    const weekEnd = formatDateToISO(getSundayOfWeek(entryDate))

    const weekEntries = await this.scheduleEntryRepository.findByDateRange(
      weekStart,
      weekEnd,
    )

    const assignmentCounts = new Map<string, number>()
    for (const tm of eligibleMembers) {
      assignmentCounts.set(tm.id, 0)
    }

    for (const weekEntry of weekEntries) {
      for (const mapItem of weekEntry.props.teamMembers.getItems()) {
        const current = assignmentCounts.get(mapItem.props.teamMemberId)
        if (current !== undefined) {
          assignmentCounts.set(mapItem.props.teamMemberId, current + 1)
        }
      }
    }

    const candidates: SwapCandidate[] = eligibleMembers
      .map((tm) => ({
        teamMember: tm,
        weekAssignmentCount: assignmentCounts.get(tm.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          a.weekAssignmentCount - b.weekAssignmentCount ||
          a.teamMember.props.name.localeCompare(b.teamMember.props.name),
      )

    return {
      swapContext: {
        profession: targetMember.props.profession,
        specialty: isSpecialtySlot ? targetMember.props.specialty : null,
      },
      candidates,
    }
  }
}
