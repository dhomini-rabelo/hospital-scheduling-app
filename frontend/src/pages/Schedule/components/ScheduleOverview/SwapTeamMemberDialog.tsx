import { Badge } from '@/layout/components/ui/Badge'
import { Button } from '@/layout/components/ui/Button'
import {
  listSwapCandidates,
  swapTeamMember,
} from '@/server/api/schedule-entries'
import {
  PROFESSION_LABELS,
  type SwapCandidate,
  type SwapContext,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import axios from 'axios'
import { ArrowLeftRight, Loader2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

type SwapDialogStage = 'loading' | 'select' | 'swapping'

interface SwapTeamMemberDialogState {
  stage: SwapDialogStage
  candidates: SwapCandidate[]
  swapContext: SwapContext | null
  selectedCandidateId: string | null
  error: string | null
}

const VALIDATION_ERROR_MESSAGES: Record<
  string,
  (...variables: string[]) => string
> = {
  TEAM_MEMBER_NOT_ASSIGNED_TO_ENTRY: () =>
    'This team member is not assigned to this schedule entry.',
  TEAM_MEMBER_ALREADY_ASSIGNED_TO_ENTRY: () =>
    'This team member is already assigned for this day.',
  PROFESSION_MISMATCH: () => 'Replacement must have the same profession.',
  SPECIALTY_MISMATCH: () =>
    'Replacement must have the same specialty for this slot.',
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
  return 'Failed to swap team member. Please try again.'
}

interface SwapTeamMemberDialogProps {
  entryId: string
  teamMemberId: string
  teamMemberName: string
  onClose: () => void
  onSuccess: () => void
}

export function SwapTeamMemberDialog({
  entryId,
  teamMemberId,
  teamMemberName,
  onClose,
  onSuccess,
}: SwapTeamMemberDialogProps) {
  const [state, setState] = useState<SwapTeamMemberDialogState>({
    stage: 'loading',
    candidates: [],
    swapContext: null,
    selectedCandidateId: null,
    error: null,
  })

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await listSwapCandidates(entryId, teamMemberId)
        setState((previousState) => ({
          ...previousState,
          stage: 'select',
          candidates: response.candidates,
          swapContext: response.swapContext,
        }))
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.status === 400
            ? parseValidationError(error.response.data)
            : 'Failed to load swap candidates. Please try again.'
        setState((previousState) => ({
          ...previousState,
          stage: 'select',
          error: errorMessage,
        }))
      }
    }

    loadCandidates()
  }, [entryId, teamMemberId])

  function handleSelectCandidate(candidateId: string) {
    setState((previousState) => ({
      ...previousState,
      selectedCandidateId: candidateId,
      error: null,
    }))
  }

  async function handleSwap() {
    if (!state.selectedCandidateId) return

    setState((previousState) => ({
      ...previousState,
      stage: 'swapping',
      error: null,
    }))

    try {
      await swapTeamMember(entryId, {
        removeTeamMemberId: teamMemberId,
        addTeamMemberId: state.selectedCandidateId,
      })
      onSuccess()
      onClose()
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.status === 400
          ? parseValidationError(error.response.data)
          : 'Failed to swap team member. Please try again.'
      setState((previousState) => ({
        ...previousState,
        stage: 'select',
        error: errorMessage,
      }))
    }
  }

  const isInteractionBlocked =
    state.stage === 'loading' || state.stage === 'swapping'

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={isInteractionBlocked ? undefined : onClose}
        role="presentation"
      />
      <div className="modal-content card-raised relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
            <ArrowLeftRight size={16} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-4">Swap {teamMemberName}</h2>
            <p className="text-xs text-text-tertiary">
              {state.swapContext
                ? `${PROFESSION_LABELS[state.swapContext.profession]}${state.swapContext.specialty ? ` — ${formatSpecialtyLabel(state.swapContext.specialty)}` : ''} slot`
                : 'Select a replacement team member'}
            </p>
          </div>
        </div>

        {state.stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2
              size={28}
              className="mb-3 animate-spin text-primary-500"
            />
            <p className="font-heading text-sm font-semibold text-text-secondary">
              Loading replacement candidates...
            </p>
          </div>
        )}

        {(state.stage === 'select' || state.stage === 'swapping') && (
          <div className="flex flex-col gap-5">
            {state.candidates.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="font-heading text-sm font-semibold text-text-secondary">
                  Available Replacements ({state.candidates.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {state.candidates.map((candidate) => (
                    <button
                      key={candidate.teamMember.id}
                      type="button"
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        state.selectedCandidateId === candidate.teamMember.id
                          ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-500'
                          : 'border-border/40 bg-surface hover:bg-neutral-50'
                      }`}
                      onClick={() =>
                        handleSelectCandidate(candidate.teamMember.id)
                      }
                      disabled={state.stage === 'swapping'}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">
                          {candidate.teamMember.name}
                        </span>
                        <Badge variant="primary">
                          {PROFESSION_LABELS[candidate.teamMember.profession]}
                        </Badge>
                        <Badge variant="secondary">
                          {formatSpecialtyLabel(
                            candidate.teamMember.specialty,
                          )}
                        </Badge>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {candidate.weekAssignmentCount}{' '}
                        {candidate.weekAssignmentCount === 1
                          ? 'day'
                          : 'days'}{' '}
                        this week
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                  <Users size={18} className="text-text-tertiary" />
                </div>
                <p className="font-heading text-sm font-semibold text-text-secondary">
                  No eligible replacements available
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  All eligible team members are already assigned for this day.
                </p>
              </div>
            )}

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
                disabled={state.stage === 'swapping'}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSwap}
                disabled={
                  state.selectedCandidateId === null ||
                  state.stage === 'swapping'
                }
                isLoading={state.stage === 'swapping'}
              >
                <ArrowLeftRight size={14} />
                Swap
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
