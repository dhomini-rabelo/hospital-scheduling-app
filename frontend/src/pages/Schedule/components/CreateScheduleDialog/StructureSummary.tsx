import { Badge } from '@/layout/components/ui/Badge'
import {
  PROFESSION_LABELS,
  type Profession,
  formatSpecialtyLabel,
  type Specialty,
} from '@/server/types/entities'
import { useFormContext, useWatch } from 'react-hook-form'
import type { SetScheduleSchema } from './SetScheduleDialog'

export function StructureSummary() {
  const { control } = useFormContext<SetScheduleSchema>()

  const structure = useWatch({
    control,
    name: 'structure',
  })

  const validProfessions = (structure ?? []).filter(
    (row) => row.profession && row.requiredCount > 0,
  )

  if (validProfessions.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {validProfessions.map((row) => (
        <div
          key={row.profession}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-surface px-3 py-2.5"
        >
          <Badge variant="primary">
            {PROFESSION_LABELS[row.profession as Profession]}
          </Badge>
          <span className="text-sm text-text-secondary">
            {row.requiredCount} required
          </span>
          {row.specialtyRequirements.length > 0 && (
            <>
              <span className="text-xs text-text-tertiary">—</span>
              {row.specialtyRequirements
                .filter((s) => s.specialty && s.requiredCount > 0)
                .map((s) => (
                  <Badge key={s.specialty} variant="secondary">
                    {s.requiredCount} {formatSpecialtyLabel(s.specialty as Specialty)}
                  </Badge>
                ))}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
