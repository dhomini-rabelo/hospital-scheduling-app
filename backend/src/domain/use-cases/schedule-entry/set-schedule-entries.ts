import { ScheduleEntryRepository } from '@/adapters/repositories/schedule-entry-repository'
import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import {
  ScheduleEntry,
  StructureData,
  StructureDataJsonField,
} from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryTeamMemberMap } from '@/domain/entities/schedule-entry/schedule-entry-team-member-map'
import { ScheduleEntryTeamMemberMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-team-member-map'
import {
  validateStructureData,
  validateTeamMembersAgainstStructure,
} from '@/domain/use-cases/utils/schedule-entry'
import { validateDatesInSetRange } from '@/domain/utils/schedule'
import { ValidationError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  dates: string[]
  structure: StructureData
  teamMemberIds: string[]
}

interface Response {
  items: ScheduleEntry[]
}

export class SetScheduleEntriesUseCase implements UseCase<Response> {
  constructor(
    private scheduleEntryRepository: ScheduleEntryRepository,
    private teamMemberRepository: TeamMemberRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    validateDatesInSetRange(payload.dates)
    validateStructureData(payload.structure)

    const allTeamMembers = await this.teamMemberRepository.findAll()
    const resolvedTeamMembers = payload.teamMemberIds.map((id) => {
      const teamMember = allTeamMembers.find((tm) => tm.id === id)
      if (!teamMember) {
        throw new ValidationError({
          errorField: 'teamMemberIds',
          code: 'TEAM_MEMBER_NOT_FOUND',
          variables: [id],
        })
      }
      return teamMember
    })

    validateTeamMembersAgainstStructure(resolvedTeamMembers, payload.structure)

    const items: ScheduleEntry[] = []

    for (const date of payload.dates) {
      const existingEntry = await this.scheduleEntryRepository.findByDate(date)

      if (existingEntry) {
        const mapEntities = payload.teamMemberIds.map((teamMemberId) =>
          ScheduleEntryTeamMemberMap.create({
            scheduleEntryId: existingEntry.id,
            teamMemberId,
          }),
        )
        existingEntry.props.teamMembers.update(mapEntities)

        const updatedEntry = await this.scheduleEntryRepository.update(
          existingEntry.id,
          {
            structure: StructureDataJsonField.create(payload.structure),
            teamMembers: existingEntry.props.teamMembers,
          },
        )
        items.push(updatedEntry)
      } else {
        const mapEntities = payload.teamMemberIds.map((teamMemberId) =>
          ScheduleEntryTeamMemberMap.create({
            scheduleEntryId: '',
            teamMemberId,
          }),
        )

        const createdEntry = await this.scheduleEntryRepository.create({
          date,
          structure: StructureDataJsonField.create(payload.structure),
          teamMembers: new ScheduleEntryTeamMemberMapWatchedList(mapEntities),
        })
        items.push(createdEntry)
      }
    }

    return { items }
  }
}
