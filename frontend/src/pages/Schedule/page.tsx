import { Button } from '@/layout/components/ui/Button'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import { useQueryClient } from '@tanstack/react-query'
import { Calendar, Settings } from 'lucide-react'
import { useState } from 'react'
import { SetScheduleDialog } from './components/CreateScheduleDialog/SetScheduleDialog'
import { MiniCalendar } from './components/MiniCalendar/MiniCalendar'
import { ScheduleOverview } from './components/ScheduleOverview/ScheduleOverview'
import { getTodayISO } from './utils/schedule-dates'

interface SchedulePageState {
  selectedDate: string
}

export function Schedule() {
  const [state, setState] = useState<SchedulePageState>({
    selectedDate: getTodayISO(),
  })
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'create'>()
  const queryClient = useQueryClient()

  function handleSelectDate(date: string) {
    setState((previousState) => ({
      ...previousState,
      selectedDate: date,
    }))
  }

  function handleMutationSuccess() {
    queryClient.invalidateQueries({
      queryKey: [API_ROUTES.scheduleEntries.overview],
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Calendar size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-heading-2">Schedule</h1>
            <p className="text-sm text-text-tertiary">
              View and manage daily staff schedules
            </p>
          </div>
        </div>
        <Button onClick={() => activateDialog('create')}>
          <Settings size={16} />
          Set Schedule
        </Button>
      </div>

      {currentActiveDialog === 'create' && (
        <SetScheduleDialog
          onClose={disableDialog}
          onSuccess={handleMutationSuccess}
        />
      )}

      <MiniCalendar
        selectedDate={state.selectedDate}
        onSelectDate={handleSelectDate}
      />

      <ScheduleOverview selectedDate={state.selectedDate} />
    </div>
  )
}
