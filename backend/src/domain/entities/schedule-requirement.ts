import { Entity } from '@/modules/domain/entity'
import { JsonField } from '@/modules/domain/json-field'

export type SpecialtyRequirement = {
  specialty: string
  requiredCount: number
}

export type ProfessionRequirement = {
  profession: string
  requiredCount: number
  specialtyRequirements: SpecialtyRequirement[]
}

export type RequirementsData = ProfessionRequirement[]

export class RequirementsDataJsonField extends JsonField<RequirementsData> {
  static create(value: RequirementsData) {
    return new RequirementsDataJsonField(value)
  }
}

export type ScheduleRequirementProps = {
  dateReference: string
  requirements: RequirementsDataJsonField
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export class ScheduleRequirement extends Entity<ScheduleRequirementProps> {
  static create(
    props: Omit<
      ScheduleRequirementProps,
      'createdAt' | 'updatedAt' | 'isEnabled'
    >,
  ) {
    const now = new Date()
    return new ScheduleRequirement({
      ...props,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reference(id: string, props: ScheduleRequirementProps) {
    return new ScheduleRequirement(props, id)
  }
}
