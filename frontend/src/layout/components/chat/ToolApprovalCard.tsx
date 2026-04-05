import { Button } from '@/layout/components/ui/Button'
import { Check, X } from 'lucide-react'
import { AutoFillCard } from './tool-cards/AutoFillCard'
import { CreateTeamMemberCard } from './tool-cards/CreateTeamMemberCard'
import { GenericToolCard } from './tool-cards/GenericToolCard'
import { SwapCard } from './tool-cards/SwapCard'

interface ToolApprovalCardProps {
  toolName: string
  args: Record<string, unknown>
  approvalId: string
  onApprove: (approvalId: string) => void
  onReject: (approvalId: string, reason: string) => void
}

function renderToolCard(
  toolName: string,
  args: Record<string, unknown>,
): React.ReactNode {
  switch (toolName) {
    case 'createTeamMembers':
      return <CreateTeamMemberCard args={args as { items?: { name: string; profession: string; specialty: string }[] }} />
    case 'autoFillSchedule':
      return <AutoFillCard args={args as { weekStartDate?: string }} />
    case 'swapTeamMember':
      return <SwapCard args={args as { entryId?: string; removeTeamMemberId?: string; addTeamMemberId?: string }} />
    default:
      return <GenericToolCard args={args} />
  }
}

export function ToolApprovalCard({
  toolName,
  args,
  approvalId,
  onApprove,
  onReject,
}: ToolApprovalCardProps) {
  function handleApprove() {
    onApprove(approvalId)
  }

  function handleReject() {
    onReject(approvalId, `User rejected ${toolName}`)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface p-3">
      {renderToolCard(toolName, args)}
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={handleApprove}>
          <Check size={14} />
          Approve
        </Button>
        <Button variant="secondary" size="sm" onClick={handleReject}>
          <X size={14} />
          Reject
        </Button>
      </div>
    </div>
  )
}
