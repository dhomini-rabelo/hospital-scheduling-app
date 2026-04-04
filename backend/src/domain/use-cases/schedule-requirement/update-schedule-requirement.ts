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
  id: string
  requirements: RequirementsData
}

interface Response {
  item: ScheduleRequirement
}

export class UpdateScheduleRequirementUseCase implements UseCase<Response> {
  constructor(
    private scheduleRequirementRepository: ScheduleRequirementRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const scheduleRequirement =
      await this.scheduleRequirementRepository.findById(payload.id)

    if (!scheduleRequirement) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'SCHEDULE_REQUIREMENT_NOT_FOUND',
        variables: [payload.id],
      })
    }

    validateRequirementsData(payload.requirements)

    const item = await this.scheduleRequirementRepository.update(payload.id, {
      requirements: RequirementsDataJsonField.create(payload.requirements),
    })

    return { item }
  }
}
