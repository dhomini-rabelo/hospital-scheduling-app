import { Badge } from '@/layout/components/ui/Badge'
import {
  PROFESSION_LABELS,
  type ScheduleOverviewEntry,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { ArrowLeftRight, Users } from 'lucide-react'

interface AssignedMembersListProps {
  entries: ScheduleOverviewEntry[]
  onSwap: (teamMemberId: string, teamMemberName: string) => void
}

export function AssignedMembersList({
  entries,
  onSwap,
}: AssignedMembersListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <Users size={18} className="text-text-tertiary" />
        </div>
        <p className="text-sm text-text-tertiary">No staff assigned</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-heading text-sm font-semibold text-text-secondary">
        Assigned Staff ({entries.length})
      </h4>
      <div className="flex flex-col gap-1.5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-surface px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">
                {entry.teamMember.name}
              </span>
              <Badge variant="primary">
                {PROFESSION_LABELS[entry.teamMember.profession]}
              </Badge>
              <Badge variant="secondary">
                {formatSpecialtyLabel(entry.teamMember.specialty)}
              </Badge>
            </div>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-neutral-100 hover:text-text-secondary"
              onClick={() =>
                onSwap(entry.teamMember.id, entry.teamMember.name)
              }
              title={`Swap ${entry.teamMember.name}`}
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
