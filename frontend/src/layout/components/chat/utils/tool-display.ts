export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  createTeamMembers: 'Create Team Members',
  listTeamMembers: 'List Team Members',
  updateTeamMember: 'Update Team Member',
  deleteTeamMember: 'Delete Team Member',
  createScheduleRequirement: 'Create Schedule Requirement',
  listScheduleRequirements: 'List Schedule Requirements',
  updateScheduleRequirement: 'Update Schedule Requirement',
  enableScheduleRequirement: 'Enable Schedule Requirement',
  disableScheduleRequirement: 'Disable Schedule Requirement',
  deleteScheduleRequirement: 'Delete Schedule Requirement',
  setScheduleEntries: 'Set Schedule Entries',
  autoFillSchedule: 'Auto-fill Schedule',
  listScheduleEntries: 'List Schedule Entries',
  deleteScheduleEntry: 'Delete Schedule Entry',
  getScheduleOverview: 'Get Schedule Overview',
  listSwapCandidates: 'List Swap Candidates',
  swapTeamMember: 'Swap Team Member',
  autoFillDayGaps: 'Auto-fill Day Gaps',
}

export function getToolDisplayName(toolName: string): string {
  return TOOL_DISPLAY_NAMES[toolName] ?? toolName
}
