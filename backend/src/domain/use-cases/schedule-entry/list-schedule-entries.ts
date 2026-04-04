import {
  ScheduleEntryRepository,
  ScheduleEntryWithAggregateData,
} from '@/adapters/repositories/schedule-entry-repository'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  startDate: string
  endDate: string
}

interface Response {
  items: ScheduleEntryWithAggregateData[]
}

export class ListScheduleEntriesUseCase implements UseCase<Response> {
  constructor(private scheduleEntryRepository: ScheduleEntryRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const items = await this.scheduleEntryRepository.listWithAggregateData(
      payload.startDate,
      payload.endDate,
    )

    return { items }
  }
}
