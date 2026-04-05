import { Calendar } from 'lucide-react'

interface AutoFillCardProps {
  args: { weekStartDate?: string }
}

export function AutoFillCard({ args }: AutoFillCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-sunken/30 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
        <Calendar size={16} className="text-primary-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text-primary">
          Auto-fill Week
        </span>
        <span className="text-xs text-text-tertiary">
          Starting {args.weekStartDate ?? 'unknown'}
        </span>
      </div>
    </div>
  )
}
