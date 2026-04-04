import { ScheduleRequirementRepository } from '@/adapters/repositories/schedule-requirement-repository'
import { ScheduleRequirement } from '@/domain/entities/schedule-requirement'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  id: string
}

interface Response {
  item: ScheduleRequirement
}

export class EnableScheduleRequirementUseCase implements UseCase<Response> {
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

    const item = await this.scheduleRequirementRepository.updateIsEnabled(
      payload.id,
      true,
    )

    return { item }
  }
}
