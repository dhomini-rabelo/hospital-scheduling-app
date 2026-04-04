import { ScheduleRequirementRepository } from '@/adapters/repositories/schedule-requirement-repository'
import {
  RequirementsData,
  RequirementsDataJsonField,
  ScheduleRequirement,
} from '@/domain/entities/schedule-requirement'
import { validateRequirementsData } from '@/domain/use-cases/utils/schedule-requirement'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  dateReference: string
  requirements: RequirementsData
}

interface Response {
  item: ScheduleRequirement
}

export class CreateScheduleRequirementUseCase implements UseCase<Response> {
  constructor(
    private scheduleRequirementRepository: ScheduleRequirementRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    validateRequirementsData(payload.requirements)

    const existingRequirement =
      await this.scheduleRequirementRepository.findByDateReference(
        payload.dateReference,
      )

    if (existingRequirement) {
      throw new DomainError({
        errorType: DangerErrors.DATA_INTEGRITY,
        code: 'DUPLICATE_DATE_REFERENCE',
        variables: [payload.dateReference],
      })
    }

    const item = await this.scheduleRequirementRepository.create({
      dateReference: payload.dateReference,
      requirements: RequirementsDataJsonField.create(payload.requirements),
    })

    return { item }
  }
}
