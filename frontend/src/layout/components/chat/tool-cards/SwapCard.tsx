import { ArrowRight } from 'lucide-react'

interface SwapCardProps {
  args: {
    entryId?: string
    removeTeamMemberId?: string
    addTeamMemberId?: string
  }
}

export function SwapCard({ args }: SwapCardProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-sunken/30 p-3">
      <div className="flex-1 rounded-lg bg-error-50 p-2 text-center">
        <span className="text-xs font-medium text-text-tertiary">Remove</span>
        <p className="mt-0.5 truncate text-xs text-error-700">
          {args.removeTeamMemberId?.slice(0, 8) ?? '...'}
        </p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-text-tertiary" />
      <div className="flex-1 rounded-lg bg-success-50 p-2 text-center">
        <span className="text-xs font-medium text-text-tertiary">Add</span>
        <p className="mt-0.5 truncate text-xs text-success-700">
          {args.addTeamMemberId?.slice(0, 8) ?? '...'}
        </p>
      </div>
    </div>
  )
}
