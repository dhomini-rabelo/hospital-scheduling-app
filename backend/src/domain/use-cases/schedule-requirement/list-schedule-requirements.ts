import { ScheduleRequirementRepository } from '@/adapters/repositories/schedule-requirement-repository'
import { ScheduleRequirement } from '@/domain/entities/schedule-requirement'
import { UseCase } from '@/modules/domain/use-case'

interface Response {
  items: ScheduleRequirement[]
}

export class ListScheduleRequirementsUseCase implements UseCase<Response> {
  constructor(
    private scheduleRequirementRepository: ScheduleRequirementRepository,
  ) {}

  async execute(): Promise<Response> {
    const items = await this.scheduleRequirementRepository.findAll()
    return { items }
  }
}
