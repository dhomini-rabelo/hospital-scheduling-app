import { scheduleEntryTools } from '@/infra/http/chat/tools/schedule-entry-tools'
import { scheduleRequirementTools } from '@/infra/http/chat/tools/schedule-requirement-tools'
import { teamMemberTools } from '@/infra/http/chat/tools/team-member-tools'

export const allTools = {
  ...teamMemberTools,
  ...scheduleRequirementTools,
  ...scheduleEntryTools,
}
