import { client } from '@/core/api-client'
import { API_ROUTES } from '@/server/routes'
import type {
  Profession,
  ScheduleRequirement,
} from '@/server/types/entities'

export interface CreateScheduleRequirementInput {
  dateReference: string
  requirements: {
    profession: Profession
    requiredCount: number
    specialtyRequirements: {
      specialty: string
      requiredCount: number
    }[]
  }[]
}

export interface UpdateScheduleRequirementInput {
  requirements: {
    profession: Profession
    requiredCount: number
    specialtyRequirements: {
      specialty: string
      requiredCount: number
    }[]
  }[]
}

export async function fetchScheduleRequirements(): Promise<
  ScheduleRequirement[]
> {
  const response = await client.get<ScheduleRequirement[]>(
    API_ROUTES.scheduleRequirements.list,
  )
  return response.data
}

export async function createScheduleRequirement(
  data: CreateScheduleRequirementInput,
): Promise<ScheduleRequirement> {
  const response = await client.post<ScheduleRequirement>(
    API_ROUTES.scheduleRequirements.create,
    data,
  )
  return response.data
}

export async function updateScheduleRequirement(
  id: string,
  data: UpdateScheduleRequirementInput,
): Promise<ScheduleRequirement> {
  const response = await client.put<ScheduleRequirement>(
    API_ROUTES.scheduleRequirements.update(id),
    data,
  )
  return response.data
}

export async function enableScheduleRequirement(
  id: string,
): Promise<ScheduleRequirement> {
  const response = await client.patch<ScheduleRequirement>(
    API_ROUTES.scheduleRequirements.enable(id),
  )
  return response.data
}

export async function disableScheduleRequirement(
  id: string,
): Promise<ScheduleRequirement> {
  const response = await client.patch<ScheduleRequirement>(
    API_ROUTES.scheduleRequirements.disable(id),
  )
  return response.data
}

export async function deleteScheduleRequirement(id: string): Promise<void> {
  await client.delete(API_ROUTES.scheduleRequirements.delete(id))
}
