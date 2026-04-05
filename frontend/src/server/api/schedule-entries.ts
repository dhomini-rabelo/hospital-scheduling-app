import { client } from '@/core/api-client'
import { API_ROUTES } from '@/server/routes'
import type {
  AutoFillResponse,
  ProfessionRequirement,
  ScheduleEntry,
  ScheduleEntryWithAggregateData,
  ScheduleOverview,
} from '@/server/types/entities'

export interface SetScheduleEntriesInput {
  dates: string[]
  structure: ProfessionRequirement[]
  scheduleRequirementIds: string[]
}

export async function setScheduleEntries(
  data: SetScheduleEntriesInput,
): Promise<ScheduleEntry[]> {
  const response = await client.put<ScheduleEntry[]>(
    API_ROUTES.scheduleEntries.set,
    data,
  )
  return response.data
}

export async function fetchScheduleEntries(
  startDate: string,
  endDate: string,
): Promise<ScheduleEntryWithAggregateData[]> {
  const response = await client.get<ScheduleEntryWithAggregateData[]>(
    API_ROUTES.scheduleEntries.list,
    { params: { startDate, endDate } },
  )
  return response.data
}

export async function deleteScheduleEntry(id: string): Promise<void> {
  await client.delete(API_ROUTES.scheduleEntries.delete(id))
}

export async function fetchScheduleOverview(
  date: string,
): Promise<ScheduleOverview> {
  const response = await client.get<ScheduleOverview>(
    API_ROUTES.scheduleEntries.overview,
    { params: { date } },
  )
  return response.data
}

export async function autoFillSchedule(
  data: { weekStartDate: string },
): Promise<AutoFillResponse> {
  const response = await client.post<AutoFillResponse>(
    API_ROUTES.scheduleEntries.autoFill,
    data,
  )
  return response.data
}
