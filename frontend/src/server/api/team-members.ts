import { client } from '@/core/api-client'
import { API_ROUTES } from '@/server/routes'
import type { Profession, TeamMember } from '@/server/types/entities'

export interface CreateTeamMemberInput {
  name: string
  profession: Profession
  specialty: string
}

export interface UpdateTeamMemberInput {
  name?: string
  profession?: Profession
  specialty?: string
}

export async function createTeamMembers(
  items: CreateTeamMemberInput[],
): Promise<TeamMember[]> {
  const response = await client.post<TeamMember[]>(API_ROUTES.teamMembers.create, {
    items,
  })
  return response.data
}

export async function fetchTeamMembers(
  profession?: Profession,
): Promise<TeamMember[]> {
  const response = await client.get<TeamMember[]>(API_ROUTES.teamMembers.list, {
    params: profession ? { profession } : undefined,
  })
  return response.data
}

export async function updateTeamMember(
  id: string,
  data: UpdateTeamMemberInput,
): Promise<TeamMember> {
  const response = await client.put<TeamMember>(
    API_ROUTES.teamMembers.update(id),
    data,
  )
  return response.data
}

export async function deleteTeamMember(id: string): Promise<void> {
  await client.delete(API_ROUTES.teamMembers.delete(id))
}
