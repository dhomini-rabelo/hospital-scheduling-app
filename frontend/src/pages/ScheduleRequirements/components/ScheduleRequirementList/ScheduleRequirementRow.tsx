import { Badge } from '@/layout/components/ui/Badge'
import type { ScheduleRequirement, Specialty } from '@/server/types/entities'
import {
    PROFESSION_LABELS,
    Profession,
    formatSpecialtyLabel,
} from '@/server/types/entities'
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'

interface ScheduleRequirementRowProps {
  requirement: ScheduleRequirement
  onEdit: (requirement: ScheduleRequirement) => void
  onDelete: (requirement: ScheduleRequirement) => void
  onToggleEnabled: (requirement: ScheduleRequirement) => void
  index: number
}

function formatRequirementSummary(
  profession: Profession,
  requiredCount: number,
  specialtyRequirements: { specialty: string; requiredCount: number }[],
): string {
  const professionLabel = PROFESSION_LABELS[profession]
  const base = `${requiredCount} ${professionLabel}${requiredCount > 1 ? 's' : ''}`
  if (specialtyRequirements.length === 0) return base
  const specialties = specialtyRequirements
    .map(
      (s) =>
        `${s.requiredCount} ${formatSpecialtyLabel(s.specialty as Specialty)}`,
    )
    .join(', ')
  return `${base} (${specialties})`
}

export function ScheduleRequirementRow({
  requirement,
  onEdit,
  onDelete,
  onToggleEnabled,
  index,
}: ScheduleRequirementRowProps) {
  return (
    <tr
      className={`border-b border-border/60 transition-colors duration-(--transition-base) last:border-b-0 hover:bg-surface-sunken/50 ${!requirement.isEnabled ? 'opacity-60' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="px-6 py-4 text-sm font-semibold text-text-primary">
        {requirement.dateReference}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {requirement.requirements.map((profReq) => (
            <span key={profReq.profession} className="text-sm text-text-secondary">
              {formatRequirementSummary(
                profReq.profession,
                profReq.requiredCount,
                profReq.specialtyRequirements,
              )}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={requirement.isEnabled ? 'success' : 'secondary'}>
          {requirement.isEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggleEnabled(requirement)}
            className="rounded-lg p-2 text-text-tertiary transition-all duration-(--transition-base) hover:bg-neutral-100 hover:text-text-primary"
            title={requirement.isEnabled ? 'Disable' : 'Enable'}
          >
            {requirement.isEnabled ? (
              <ToggleRight size={15} className="text-success-600" />
            ) : (
              <ToggleLeft size={15} />
            )}
          </button>
          <button
            onClick={() => onEdit(requirement)}
            className="rounded-lg p-2 text-text-tertiary transition-all duration-(--transition-base) hover:bg-primary-50 hover:text-primary-600"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(requirement)}
            className="rounded-lg p-2 text-text-tertiary transition-all duration-(--transition-base) hover:bg-error-50 hover:text-error-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}
