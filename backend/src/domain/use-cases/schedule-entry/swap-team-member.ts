import { ScheduleEntryRepository } from '@/adapters/repositories/schedule-entry-repository'
import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import { ScheduleEntry } from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryTeamMemberMap } from '@/domain/entities/schedule-entry/schedule-entry-team-member-map'
import {
  determineIsSpecialtySlot,
  validateTeamMemberIsAssignedToEntry,
} from '@/domain/use-cases/utils/schedule-entry'
import {
  DangerErrors,
  DomainError,
  ValidationError,
} from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  entryId: string
  removeTeamMemberId: string
  addTeamMemberId: string
}

interface Response {
  item: ScheduleEntry
}

export class SwapTeamMemberUseCase implements UseCase<Response> {
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

    const removeMapEntity = validateTeamMemberIsAssignedToEntry(
      entry,
      payload.removeTeamMemberId,
    )

    const alreadyAssigned = entry.props.teamMembers
      .getItems()
      .some((item) => item.props.teamMemberId === payload.addTeamMemberId)

    if (alreadyAssigned) {
      throw new ValidationError({
        errorField: 'addTeamMemberId',
        code: 'TEAM_MEMBER_ALREADY_ASSIGNED_TO_ENTRY',
        variables: [payload.addTeamMemberId],
      })
    }

    const removeMember = await this.teamMemberRepository.findById(
      payload.removeTeamMemberId,
    )

    if (!removeMember) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'TEAM_MEMBER_NOT_FOUND',
        variables: [payload.removeTeamMemberId],
      })
    }

    const addMember = await this.teamMemberRepository.findById(
      payload.addTeamMemberId,
    )

    if (!addMember) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'TEAM_MEMBER_NOT_FOUND',
        variables: [payload.addTeamMemberId],
      })
    }

    if (addMember.props.profession !== removeMember.props.profession) {
      throw new ValidationError({
        errorField: 'addTeamMemberId',
        code: 'PROFESSION_MISMATCH',
        variables: [addMember.props.profession, removeMember.props.profession],
      })
    }

    const allProfessionMembers = await this.teamMemberRepository.findAll(
      removeMember.props.profession,
    )

    const assignedTeamMemberIds = entry.props.teamMembers
      .getItems()
      .map((item) => item.props.teamMemberId)

    const isSpecialtySlot = determineIsSpecialtySlot(
      entry.props.structure.value,
      assignedTeamMemberIds,
      allProfessionMembers,
      removeMember,
    )

    if (
      isSpecialtySlot &&
      addMember.props.specialty !== removeMember.props.specialty
    ) {
      throw new ValidationError({
        errorField: 'addTeamMemberId',
        code: 'SPECIALTY_MISMATCH',
        variables: [addMember.props.specialty, removeMember.props.specialty],
      })
    }

    entry.props.teamMembers.remove(removeMapEntity)

    entry.props.teamMembers.add(
      ScheduleEntryTeamMemberMap.create({
        scheduleEntryId: entry.id,
        teamMemberId: payload.addTeamMemberId,
      }),
    )

    const updatedEntry = await this.scheduleEntryRepository.update(entry.id, {
      structure: entry.props.structure,
      teamMembers: entry.props.teamMembers,
    })

    return { item: updatedEntry }
  }
}
