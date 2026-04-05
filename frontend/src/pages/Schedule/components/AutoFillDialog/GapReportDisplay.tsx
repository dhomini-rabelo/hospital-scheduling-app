import { Badge } from '@/layout/components/ui/Badge'
import {
  type AutoFillGapReport,
  type DayGap,
  PROFESSION_LABELS,
  type ProfessionGap,
  type Specialty,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatDateDisplay } from '../../utils/schedule-dates'

interface GapReportDisplayProps {
  gapReport: AutoFillGapReport
}

function ProfessionGapRow({ gap }: { gap: ProfessionGap }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {PROFESSION_LABELS[gap.profession]}
          </span>
          <span className="text-xs text-text-tertiary">
            {gap.assignedCount} / {gap.requiredCount}
          </span>
        </div>
        {gap.deficit > 0 && (
          <Badge variant="error">
            -{gap.deficit}
          </Badge>
        )}
      </div>

      {gap.specialtyGaps.length > 0 && (
        <div className="ml-4 flex flex-col gap-1 border-l-2 border-border/40 pl-3">
          {gap.specialtyGaps.map((specialtyGap) => (
            <div
              key={specialtyGap.specialty}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  {formatSpecialtyLabel(specialtyGap.specialty as Specialty)}
                </span>
                <span className="text-xs text-text-tertiary">
                  {specialtyGap.assignedCount} / {specialtyGap.requiredCount}
                </span>
              </div>
              {specialtyGap.deficit > 0 && (
                <Badge variant="error">
                  -{specialtyGap.deficit}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DayGapSection({ dayGap }: { dayGap: DayGap }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-sunken/30 p-4">
      <h4 className="mb-3 font-heading text-sm font-semibold text-text-secondary">
        {formatDateDisplay(dayGap.date)}
      </h4>
      <div className="flex flex-col gap-2.5">
        {dayGap.professionGaps.map((professionGap) => (
          <ProfessionGapRow
            key={professionGap.profession}
            gap={professionGap}
          />
        ))}
      </div>
    </div>
  )
}

export function GapReportDisplay({ gapReport }: GapReportDisplayProps) {
  if (!gapReport.hasGaps) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success-200/60 bg-success-50 px-4 py-3">
        <CheckCircle2 size={18} className="text-success-600" />
        <p className="text-sm font-medium text-success-700">
          All requirements fully met! No staffing gaps detected.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-warning-200/60 bg-warning-50 px-4 py-3">
        <AlertTriangle size={18} className="text-warning-600" />
        <p className="text-sm font-medium text-warning-700">
          Some requirements could not be fully met due to insufficient staff.
        </p>
      </div>

      {gapReport.days.map((dayGap) => (
        <DayGapSection key={dayGap.date} dayGap={dayGap} />
      ))}
    </div>
  )
}
