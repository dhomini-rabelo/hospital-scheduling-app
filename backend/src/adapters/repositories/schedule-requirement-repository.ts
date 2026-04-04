import {
  RequirementsDataJsonField,
  ScheduleRequirement,
} from '@/domain/entities/schedule-requirement'

export type CreateScheduleRequirementInput = {
  dateReference: string
  requirements: RequirementsDataJsonField
}

export type UpdateScheduleRequirementInput = {
  requirements: RequirementsDataJsonField
}

export abstract class ScheduleRequirementRepository {
  abstract create(
    input: CreateScheduleRequirementInput,
  ): Promise<ScheduleRequirement>

  abstract findById(id: string): Promise<ScheduleRequirement | null>

  abstract findByDateReference(
    dateReference: string,
  ): Promise<ScheduleRequirement | null>

  abstract findAll(): Promise<ScheduleRequirement[]>

  abstract update(
    id: string,
    input: UpdateScheduleRequirementInput,
  ): Promise<ScheduleRequirement>

  abstract updateIsEnabled(
    id: string,
    isEnabled: boolean,
  ): Promise<ScheduleRequirement>

  abstract delete(id: string): Promise<void>
}
