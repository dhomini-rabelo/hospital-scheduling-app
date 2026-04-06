import { Button } from '@/layout/components/ui/Button'
import { useChatEntryPoint } from '@/layout/hooks/useChatEntryPoint'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, ClipboardList, Plus } from 'lucide-react'
import { CreateScheduleRequirementDialog } from './components/CreateScheduleRequirementDialog/CreateScheduleRequirementDialog'
import { ScheduleRequirementList } from './components/ScheduleRequirementList/ScheduleRequirementList'

export function ScheduleRequirements() {
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'create'>()
  const queryClient = useQueryClient()
  const { openChatWithPrompt } = useChatEntryPoint()

  function handleMutationSuccess() {
    queryClient.invalidateQueries({
      queryKey: [API_ROUTES.scheduleRequirements.list],
    })
  }

  function handleConfigureWithAI() {
    openChatWithPrompt(
      'Schedule Requirements actions:\n\n -',
    )
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
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleConfigureWithAI}>
            <Bot size={16} />
            Configure with AI
          </Button>
          <Button onClick={() => activateDialog('create')}>
            <Plus size={16} />
            Add Requirement
          </Button>
        </div>
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
