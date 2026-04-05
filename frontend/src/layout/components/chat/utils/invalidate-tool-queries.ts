import { API_ROUTES } from '@/server/routes'
import type { QueryClient } from '@tanstack/react-query'

const TOOL_INVALIDATION_MAP: Record<string, string[]> = {
  createTeamMembers: [API_ROUTES.teamMembers.list],
  updateTeamMember: [API_ROUTES.teamMembers.list],
  deleteTeamMember: [API_ROUTES.teamMembers.list],
  createScheduleRequirement: [API_ROUTES.scheduleRequirements.list],
  updateScheduleRequirement: [API_ROUTES.scheduleRequirements.list],
  deleteScheduleRequirement: [API_ROUTES.scheduleRequirements.list],
  enableScheduleRequirement: [API_ROUTES.scheduleRequirements.list],
  disableScheduleRequirement: [API_ROUTES.scheduleRequirements.list],
  setScheduleEntries: [
    API_ROUTES.scheduleEntries.overview,
    API_ROUTES.scheduleEntries.list,
  ],
  autoFillSchedule: [
    API_ROUTES.scheduleEntries.overview,
    API_ROUTES.scheduleEntries.list,
  ],
  swapTeamMember: [
    API_ROUTES.scheduleEntries.overview,
    API_ROUTES.scheduleEntries.list,
  ],
  autoFillDayGaps: [
    API_ROUTES.scheduleEntries.overview,
    API_ROUTES.scheduleEntries.list,
  ],
  deleteScheduleEntry: [
    API_ROUTES.scheduleEntries.overview,
    API_ROUTES.scheduleEntries.list,
  ],
}

export function invalidateToolQueries(
  queryClient: QueryClient,
  toolName: string,
) {
  const routes = TOOL_INVALIDATION_MAP[toolName]
  if (!routes) return
  for (const route of routes) {
    queryClient.invalidateQueries({ queryKey: [route] })
  }
}
