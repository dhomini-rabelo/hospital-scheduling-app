import { Button } from '@/layout/components/ui/Button'
import { autoFillSchedule } from '@/server/api/schedule-entries'
import type { AutoFillResponse } from '@/server/types/entities'
import axios from 'axios'
import { CalendarCheck, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { GapReportDisplay } from './GapReportDisplay'
import { WeekSelector } from './WeekSelector'

type AutoFillDialogStage = 'select' | 'loading' | 'result'

interface AutoFillDialogState {
  stage: AutoFillDialogStage
  selectedWeek: string | null
  result: AutoFillResponse | null
  error: string | null
}

const VALIDATION_ERROR_MESSAGES: Record<string, (...variables: string[]) => string> = {
  NOT_MONDAY: () => 'The selected date is not a Monday.',
  DATES_OUTSIDE_ALLOWED_RANGE: (...dates) =>
    `These dates are outside the allowed range: ${dates.join(', ')}.`,
}

function parseValidationError(responseData: Record<string, string[]>): string {
  for (const messages of Object.values(responseData)) {
    if (!Array.isArray(messages)) continue
    for (const raw of messages) {
      const [code, variablesStr] = raw.split('#')
      const variables = variablesStr ? variablesStr.split(',') : []
      const formatter = VALIDATION_ERROR_MESSAGES[code]
      if (formatter) {
        return formatter(...variables)
      }
      return raw
    }
  }
  return 'Failed to auto-fill schedule. Please try again.'
}

interface AutoFillDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function AutoFillDialog({
  onClose,
  onSuccess,
}: AutoFillDialogProps) {
  const [state, setState] = useState<AutoFillDialogState>({
    stage: 'select',
    selectedWeek: null,
    result: null,
    error: null,
  })

  function handleSelectWeek(mondayISO: string) {
    setState((previousState) => ({
      ...previousState,
      selectedWeek: mondayISO,
      error: null,
    }))
  }

  async function handleAutoFill() {
    if (!state.selectedWeek) return

    setState((previousState) => ({
      ...previousState,
      stage: 'loading',
      error: null,
    }))

    try {
      const result = await autoFillSchedule({
        weekStartDate: state.selectedWeek,
      })
      setState((previousState) => ({
        ...previousState,
        stage: 'result',
        result,
      }))
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.status === 400
          ? parseValidationError(error.response.data)
          : 'Failed to auto-fill schedule. Please try again.'
      setState((previousState) => ({
        ...previousState,
        stage: 'select',
        error: errorMessage,
      }))
    }
  }

  function handleClose() {
    onSuccess()
    onClose()
  }

  const hasEntries = state.result && state.result.entries.length > 0

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
            <Sparkles size={16} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-4">Auto-fill Schedule</h2>
            <p className="text-xs text-text-tertiary">
              {state.stage === 'result'
                ? 'Auto-fill complete'
                : 'Automatically assign team members for a week'}
            </p>
          </div>
        </div>

        {state.stage === 'select' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="font-heading text-sm font-semibold text-text-secondary">
                Select Week
              </span>
              <WeekSelector
                selectedWeek={state.selectedWeek}
                onSelectWeek={handleSelectWeek}
              />
            </div>

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
              <Button
                type="button"
                size="sm"
                onClick={handleAutoFill}
                disabled={state.selectedWeek === null}
              >
                <Sparkles size={14} />
                Auto-fill
              </Button>
            </div>
          </div>
        )}

        {state.stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={28} className="mb-3 animate-spin text-primary-500" />
            <p className="font-heading text-sm font-semibold text-text-secondary">
              Generating schedule...
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Assigning team members based on staffing requirements
            </p>
          </div>
        )}

        {state.stage === 'result' && state.result && (
          <div className="flex flex-col gap-5">
            {hasEntries ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-sunken/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                    <CalendarCheck size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-bold text-text-primary">
                      {state.result.entries.length} schedule {state.result.entries.length === 1 ? 'entry' : 'entries'} updated
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Team members have been assigned
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-heading text-sm font-semibold text-text-secondary">
                    Gap Report
                  </span>
                  <GapReportDisplay gapReport={state.result.gapReport} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                  <CalendarCheck size={18} className="text-text-tertiary" />
                </div>
                <p className="font-heading text-sm font-semibold text-text-secondary">
                  No schedule entries found for this week
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Use Set Schedule first to define the staffing structure.
                </p>
              </div>
            )}

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
