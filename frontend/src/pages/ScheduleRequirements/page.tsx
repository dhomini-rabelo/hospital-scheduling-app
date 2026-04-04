import { Button } from '@/components/ui/Button'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import { useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus } from 'lucide-react'
import { CreateScheduleRequirementDialog } from './components/ScheduleRequirementForm/CreateScheduleRequirementDialog'
import { ScheduleRequirementList } from './components/ScheduleRequirementList/ScheduleRequirementList'

export function ScheduleRequirements() {
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'create'>()
  const queryClient = useQueryClient()

  function handleMutationSuccess() {
    queryClient.invalidateQueries({
      queryKey: [API_ROUTES.scheduleRequirements.list],
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <ClipboardList size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-heading-2">Schedule Requirements</h1>
            <p className="text-sm text-text-tertiary">
              Configure staffing requirements for each date reference
            </p>
          </div>
        </div>
        <Button onClick={() => activateDialog('create')}>
          <Plus size={16} />
          Add Requirement
        </Button>
      </div>
      {currentActiveDialog === 'create' && (
        <CreateScheduleRequirementDialog
          onClose={disableDialog}
          onSuccess={handleMutationSuccess}
        />
      )}
      <ScheduleRequirementList />
    </div>
  )
}
