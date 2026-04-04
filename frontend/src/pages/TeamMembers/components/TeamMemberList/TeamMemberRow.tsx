import { Badge } from '@/components/ui/Badge'
import type { TeamMember } from '@/server/types/entities'
import {
  PROFESSION_LABELS,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { Pencil, Trash2 } from 'lucide-react'

interface TeamMemberRowProps {
  teamMember: TeamMember
  onEdit: (teamMember: TeamMember) => void
  onDelete: (teamMember: TeamMember) => void
  index: number
}

export function TeamMemberRow({
  teamMember,
  onEdit,
  onDelete,
  index,
}: TeamMemberRowProps) {
  return (
    <tr
      className="border-b border-border/60 transition-colors duration-(--transition-base) last:border-b-0 hover:bg-surface-sunken/50"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="px-6 py-4 text-sm font-semibold text-text-primary">
        {teamMember.name}
      </td>
      <td className="px-6 py-4">
        <Badge variant="primary">
          {PROFESSION_LABELS[teamMember.profession]}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant="info">
          {formatSpecialtyLabel(teamMember.specialty)}
        </Badge>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(teamMember)}
            className="rounded-lg p-2 text-text-tertiary transition-all duration-(--transition-base) hover:bg-primary-50 hover:text-primary-600"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(teamMember)}
            className="rounded-lg p-2 text-text-tertiary transition-all duration-(--transition-base) hover:bg-error-50 hover:text-error-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}
