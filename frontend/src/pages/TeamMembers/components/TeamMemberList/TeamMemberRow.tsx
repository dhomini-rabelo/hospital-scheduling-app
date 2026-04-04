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
}

export function TeamMemberRow({
  teamMember,
  onEdit,
  onDelete,
}: TeamMemberRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-3 pr-4 text-sm font-medium text-text-primary">
        {teamMember.name}
      </td>
      <td className="py-3 pr-4">
        <Badge variant="primary">
          {PROFESSION_LABELS[teamMember.profession]}
        </Badge>
      </td>
      <td className="py-3 pr-4">
        <Badge variant="info">
          {formatSpecialtyLabel(teamMember.specialty)}
        </Badge>
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(teamMember)}
            className="rounded-md p-1.5 text-text-tertiary transition-colors duration-(--transition-fast) hover:bg-neutral-100 hover:text-primary-600"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(teamMember)}
            className="rounded-md p-1.5 text-text-tertiary transition-colors duration-(--transition-fast) hover:bg-neutral-100 hover:text-error-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
