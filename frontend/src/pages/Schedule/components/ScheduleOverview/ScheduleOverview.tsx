import { Button } from '@/layout/components/ui/Button'
import { useAPIRequest } from '@/layout/hooks/useAPIRequest'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import type {
  ScheduleEntryWithAggregateData,
  ScheduleOverview as ScheduleOverviewType,
} from '@/server/types/entities'
import { Calendar, Loader2, Users, Zap } from 'lucide-react'
import { useState } from 'react'
import { formatDateDisplay } from '../../utils/schedule-dates'
import { AssignedMembersList } from './AssignedMembersList'
import { AutoFillDayDialog } from './AutoFillDayDialog'
import { FulfillmentSection } from './FulfillmentSection'
import { SwapTeamMemberDialog } from './SwapTeamMemberDialog'

interface ScheduleOverviewProps {
  selectedDate: string
}

interface ScheduleOverviewState {
  swapTarget: { teamMemberId: string; teamMemberName: string } | null
}

export function ScheduleOverview({ selectedDate }: ScheduleOverviewProps) {
  const [state, setState] = useState<ScheduleOverviewState>({
    swapTarget: null,
  })
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'swap' | 'auto-fill-day'>()

  const apiRequest = useAPIRequest<ScheduleOverviewType>({
    url: API_ROUTES.scheduleEntries.overview,
    params: { date: selectedDate },
  })

  const entriesRequest = useAPIRequest<ScheduleEntryWithAggregateData[]>({
    url: API_ROUTES.scheduleEntries.list,
    params: { startDate: selectedDate, endDate: selectedDate },
  })

  const scheduleEntryId = entriesRequest.state.data?.[0]?.id ?? null

  function handleSwap(teamMemberId: string, teamMemberName: string) {
    setState((previousState) => ({
      ...previousState,
      swapTarget: { teamMemberId, teamMemberName },
    }))
    activateDialog('swap')
  }

  function handleAutoFillDay() {
    activateDialog('auto-fill-day')
  }

  function handleMutationSuccess() {
    apiRequest.actions.refetch()
    entriesRequest.actions.refetch()
  }

  if (apiRequest.state.isLoading) {
    return (
      <div className="card flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (apiRequest.state.isError) {
    return (
      <div className="card border border-error-100 bg-error-50 py-8 text-center">
        <p className="text-sm font-medium text-error-700">
          Failed to load schedule overview. Please try again.
        </p>
      </div>
    )
  }

  if (!apiRequest.state.data) {
    return null
  }

  const overview = apiRequest.state.data
  const hasSchedule =
    overview.totalAssigned > 0 || overview.structureFulfillment !== null

  if (!hasSchedule) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Calendar size={28} className="text-text-tertiary" />
        </div>
        <p className="font-heading text-base font-semibold text-text-secondary">
          No schedule for {formatDateDisplay(selectedDate)}
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Create a schedule to assign staff for this day.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Users size={18} className="text-primary-600" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-text-primary">
              {overview.totalAssigned} staff assigned
            </p>
            <p className="text-sm text-text-tertiary">
              {formatDateDisplay(selectedDate)}
            </p>
          </div>
        </div>
        {scheduleEntryId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAutoFillDay}
          >
            <Zap size={14} />
            Fill Gaps
          </Button>
        )}
      </div>

      {overview.structureFulfillment && (
        <FulfillmentSection
          title="Schedule Structure"
          isFulfilled={overview.structureFulfillment.professions.every(
            (p) =>
              p.isFulfilled && p.specialties.every((s) => s.isFulfilled),
          )}
          professions={overview.structureFulfillment.professions}
        />
      )}

      {overview.requirementsFulfillment.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold text-text-secondary">
            Requirements Fulfillment
          </h3>
          {overview.requirementsFulfillment.map((requirement) => (
            <FulfillmentSection
              key={requirement.requirementId}
              title={requirement.dateReference}
              isFulfilled={requirement.isFulfilled}
              professions={requirement.professions}
            />
          ))}
        </div>
      )}

      <AssignedMembersList entries={overview.entries} onSwap={handleSwap} />

      {currentActiveDialog === 'swap' &&
        scheduleEntryId &&
        state.swapTarget && (
          <SwapTeamMemberDialog
            entryId={scheduleEntryId}
            teamMemberId={state.swapTarget.teamMemberId}
            teamMemberName={state.swapTarget.teamMemberName}
            onClose={disableDialog}
            onSuccess={handleMutationSuccess}
          />
        )}

      {currentActiveDialog === 'auto-fill-day' && scheduleEntryId && (
        <AutoFillDayDialog
          entryId={scheduleEntryId}
          selectedDate={selectedDate}
          onClose={disableDialog}
          onSuccess={handleMutationSuccess}
        />
      )}
    </div>
  )
}
