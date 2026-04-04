import { ScheduleRequirementRepository } from '@/adapters/repositories/schedule-requirement-repository'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  id: string
}

export class DeleteScheduleRequirementUseCase implements UseCase<void> {
  constructor(
    private scheduleRequirementRepository: ScheduleRequirementRepository,
  ) {}

  async execute(payload: Payload): Promise<void> {
    const scheduleRequirement =
      await this.scheduleRequirementRepository.findById(payload.id)

    if (!scheduleRequirement) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'SCHEDULE_REQUIREMENT_NOT_FOUND',
        variables: [payload.id],
      })
    }

    await this.scheduleRequirementRepository.delete(payload.id)
  }
}
