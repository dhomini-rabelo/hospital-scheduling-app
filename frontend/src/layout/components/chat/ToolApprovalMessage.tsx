import { Badge } from '@/layout/components/ui/Badge'
import { getToolDisplayName } from '@/layout/components/chat/utils/tool-display'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldX,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { ToolApprovalCard } from './ToolApprovalCard'

interface ToolApprovalMessageProps {
  toolName: string
  state: string
  input: Record<string, unknown>
  errorText?: string
  approval?: {
    id: string
    approved?: boolean
    reason?: string
  }
  onApprove: (approvalId: string) => void
  onReject: (approvalId: string, reason: string) => void
}

export function ToolApprovalMessage({
  toolName,
  state,
  input,
  errorText,
  approval,
  onApprove,
  onReject,
}: ToolApprovalMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayName = getToolDisplayName(toolName)

  function handleToggleExpand() {
    setIsExpanded((previous) => !previous)
  }

  if (state === 'output-available') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-success-50 px-3 py-2">
        <CheckCircle2 size={14} className="shrink-0 text-success-600" />
        <span className="text-xs font-medium text-success-700">
          {displayName} completed
        </span>
      </div>
    )
  }

  if (state === 'output-error') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-error-50 px-3 py-2">
        <XCircle size={14} className="shrink-0 text-error-600" />
        <span className="text-xs font-medium text-error-700">
          {displayName} failed{errorText ? `: ${errorText}` : ''}
        </span>
      </div>
    )
  }

  if (state === 'output-denied') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2">
        <ShieldX size={14} className="shrink-0 text-text-tertiary" />
        <span className="text-xs font-medium text-text-tertiary">
          {displayName} rejected
        </span>
      </div>
    )
  }

  if (state === 'approval-requested' && approval) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="warning">{displayName}</Badge>
          </div>
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            <Eye size={12} />
            {isExpanded ? 'Hide' : 'Review Action'}
            {isExpanded ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>
        </div>
        {isExpanded && (
          <ToolApprovalCard
            toolName={toolName}
            args={input}
            approvalId={approval.id}
            onApprove={onApprove}
            onReject={onReject}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
      <Badge variant="secondary">{displayName}</Badge>
      <span className="text-xs text-text-tertiary">
        {state === 'input-streaming' ? 'Preparing...' : 'Processing...'}
      </span>
    </div>
  )
}
