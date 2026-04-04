import { ScheduleEntryRepository } from '@/adapters/repositories/schedule-entry-repository'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  id: string
}

export class DeleteScheduleEntryUseCase implements UseCase<void> {
  constructor(private scheduleEntryRepository: ScheduleEntryRepository) {}

  async execute(payload: Payload): Promise<void> {
    const scheduleEntry = await this.scheduleEntryRepository.findById(
      payload.id,
    )

    if (!scheduleEntry) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'SCHEDULE_ENTRY_NOT_FOUND',
        variables: [payload.id],
      })
    }

    await this.scheduleEntryRepository.delete(payload.id)
  }
}
