import { ScheduleEntryRepository } from '@/adapters/repositories/schedule-entry-repository'
import { ScheduleRequirementRepository } from '@/adapters/repositories/schedule-requirement-repository'
import {
  ScheduleEntry,
  StructureData,
  StructureDataJsonField,
} from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryScheduleRequirementMap } from '@/domain/entities/schedule-entry/schedule-entry-schedule-requirement-map'
import { ScheduleEntryScheduleRequirementMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-schedule-requirement-map'
import { ScheduleEntryTeamMemberMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-team-member-map'
import { validateStructureData } from '@/domain/use-cases/utils/schedule-entry'
import { validateDatesInSetRange } from '@/domain/utils/schedule'
import { ValidationError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  dates: string[]
  structure: StructureData
  scheduleRequirementIds: string[]
}

interface Response {
  items: ScheduleEntry[]
}

export class SetScheduleEntriesUseCase implements UseCase<Response> {
  constructor(
    private scheduleEntryRepository: ScheduleEntryRepository,
    private scheduleRequirementRepository: ScheduleRequirementRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    validateDatesInSetRange(payload.dates)
    validateStructureData(payload.structure)

    const allScheduleRequirements =
      await this.scheduleRequirementRepository.findAll()
    for (const id of payload.scheduleRequirementIds) {
      const requirement = allScheduleRequirements.find((sr) => sr.id === id)
      if (!requirement) {
        throw new ValidationError({
          errorField: 'scheduleRequirementIds',
          code: 'SCHEDULE_REQUIREMENT_NOT_FOUND',
          variables: [id],
        })
      }
    }

    const items: ScheduleEntry[] = []

    for (const date of payload.dates) {
      const existingEntry = await this.scheduleEntryRepository.findByDate(date)

      if (existingEntry) {
        const requirementMapEntities = payload.scheduleRequirementIds.map(
          (scheduleRequirementId) =>
            ScheduleEntryScheduleRequirementMap.create({
              scheduleEntryId: existingEntry.id,
              scheduleRequirementId,
            }),
        )
        existingEntry.props.scheduleRequirements.update(requirementMapEntities)

        const updatedEntry = await this.scheduleEntryRepository.update(
          existingEntry.id,
          {
            structure: StructureDataJsonField.create(payload.structure),
            scheduleRequirements: existingEntry.props.scheduleRequirements,
          },
        )
        items.push(updatedEntry)
      } else {
        const requirementMapEntities = payload.scheduleRequirementIds.map(
          (scheduleRequirementId) =>
            ScheduleEntryScheduleRequirementMap.create({
              scheduleEntryId: '',
              scheduleRequirementId,
            }),
        )

        const createdEntry = await this.scheduleEntryRepository.create({
          date,
          structure: StructureDataJsonField.create(payload.structure),
          teamMembers: new ScheduleEntryTeamMemberMapWatchedList([]),
          scheduleRequirements:
            new ScheduleEntryScheduleRequirementMapWatchedList(
              requirementMapEntities,
            ),
        })
        items.push(createdEntry)
      }
    }

    return { items }
  }
}
