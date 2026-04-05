import { Badge } from '@/layout/components/ui/Badge'
import { Button } from '@/layout/components/ui/Button'
import { autoFillDayGaps } from '@/server/api/schedule-entries'
import {
  type AutoFillDayGapsResponse,
  type DayGapReport,
  PROFESSION_LABELS,
  type ProfessionGap,
  type Specialty,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import axios from 'axios'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { formatDateDisplay } from '../../utils/schedule-dates'

type AutoFillDayDialogStage = 'confirm' | 'loading' | 'result'

interface AutoFillDayDialogState {
  stage: AutoFillDayDialogStage
  result: AutoFillDayGapsResponse | null
  error: string | null
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
        {gap.deficit > 0 && <Badge variant="error">-{gap.deficit}</Badge>}
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
                <Badge variant="error">-{specialtyGap.deficit}</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DayGapReportDisplay({ gapReport }: { gapReport: DayGapReport }) {
  if (!gapReport.hasGaps) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success-200/60 bg-success-50 px-4 py-3">
        <CheckCircle2 size={18} className="text-success-600" />
        <p className="text-sm font-medium text-success-700">
          All slots filled! No staffing gaps.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-warning-200/60 bg-warning-50 px-4 py-3">
        <AlertTriangle size={18} className="text-warning-600" />
        <p className="text-sm font-medium text-warning-700">
          Some slots could not be filled due to insufficient staff.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface-sunken/30 p-4">
        <div className="flex flex-col gap-2.5">
          {gapReport.professionGaps.map((professionGap) => (
            <ProfessionGapRow
              key={professionGap.profession}
              gap={professionGap}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface AutoFillDayDialogProps {
  entryId: string
  selectedDate: string
  onClose: () => void
  onSuccess: () => void
}

export function AutoFillDayDialog({
  entryId,
  selectedDate,
  onClose,
  onSuccess,
}: AutoFillDayDialogProps) {
  const [state, setState] = useState<AutoFillDayDialogState>({
    stage: 'confirm',
    result: null,
    error: null,
  })

  async function handleAutoFill() {
    setState((previousState) => ({
      ...previousState,
      stage: 'loading',
      error: null,
    }))

    try {
      const result = await autoFillDayGaps(entryId)
      setState((previousState) => ({
        ...previousState,
        stage: 'result',
        result,
      }))
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? 'Failed to auto-fill day gaps. Please try again.'
          : 'Failed to auto-fill day gaps. Please try again.'
      setState((previousState) => ({
        ...previousState,
        stage: 'confirm',
        error: errorMessage,
      }))
    }
  }

  function handleClose() {
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={state.stage === 'loading' ? undefined : onClose}
        role="presentation"
      />
      <div className="modal-content card-raised relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
            <Zap size={16} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-4">Auto-fill Day Gaps</h2>
            <p className="text-xs text-text-tertiary">
              {state.stage === 'result'
                ? 'Auto-fill complete'
                : `Fill unfilled slots for ${formatDateDisplay(selectedDate)}`}
            </p>
          </div>
        </div>

        {state.stage === 'confirm' && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-secondary">
              Automatically assign team members to unfilled slots for{' '}
              <span className="font-semibold">
                {formatDateDisplay(selectedDate)}
              </span>
              . Existing assignments will be preserved.
            </p>

            {state.error && (
              <div className="rounded-xl border border-error-100 bg-error-50 px-4 py-2.5">
                <p className="text-sm font-medium text-error-700">
                  {state.error}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleAutoFill}>
                <Zap size={14} />
                Auto-fill
              </Button>
            </div>
          </div>
        )}

        {state.stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2
              size={28}
              className="mb-3 animate-spin text-primary-500"
            />
            <p className="font-heading text-sm font-semibold text-text-secondary">
              Filling gaps...
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Assigning team members to unfilled slots
            </p>
          </div>
        )}

        {state.stage === 'result' && state.result && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="font-heading text-sm font-semibold text-text-secondary">
                Gap Report
              </span>
              <DayGapReportDisplay gapReport={state.result.gapReport} />
            </div>

            <div className="flex items-center justify-end border-t border-border/60 pt-4">
              <Button type="button" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
