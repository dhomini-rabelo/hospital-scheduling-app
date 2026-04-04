import { useAPIRequest } from '@/layout/hooks/useAPIRequest'
import { useDialogs } from '@/layout/hooks/useDialogs'
import {
  disableScheduleRequirement,
  enableScheduleRequirement,
} from '@/server/api/schedule-requirements'
import { API_ROUTES } from '@/server/routes'
import type { ScheduleRequirement } from '@/server/types/entities'
import { ClipboardList, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { EditScheduleRequirementDialog } from '../ScheduleRequirementForm/EditScheduleRequirementDialog'
import { DeleteScheduleRequirementDialog } from './DeleteScheduleRequirementDialog'
import { ScheduleRequirementRow } from './ScheduleRequirementRow'

interface ScheduleRequirementListState {
  selectedRequirement: ScheduleRequirement | null
}

export function ScheduleRequirementList() {
  const [state, setState] = useState<ScheduleRequirementListState>({
    selectedRequirement: null,
  })
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'edit' | 'delete'>()

  const apiRequest = useAPIRequest<ScheduleRequirement[]>({
    url: API_ROUTES.scheduleRequirements.list,
  })

  function handleEdit(requirement: ScheduleRequirement) {
    setState((previousState) => ({
      ...previousState,
      selectedRequirement: requirement,
    }))
    activateDialog('edit')
  }

  function handleDelete(requirement: ScheduleRequirement) {
    setState((previousState) => ({
      ...previousState,
      selectedRequirement: requirement,
    }))
    activateDialog('delete')
  }

  function handleCloseDialog() {
    disableDialog()
    setState((previousState) => ({
      ...previousState,
      selectedRequirement: null,
    }))
  }

  function handleMutationSuccess() {
    handleCloseDialog()
    apiRequest.actions.refetch()
  }

  async function handleToggleEnabled(requirement: ScheduleRequirement) {
    try {
      if (requirement.isEnabled) {
        await disableScheduleRequirement(requirement.id)
      } else {
        await enableScheduleRequirement(requirement.id)
      }
      apiRequest.actions.refetch()
    } catch {
      apiRequest.actions.refetch()
    }
  }

  return (
    <>
      <h2 className="font-heading text-lg font-semibold text-text-primary">
        Requirements
      </h2>

      {apiRequest.state.isLoading && (
        <div className="card flex items-center justify-center py-16">
          <Loader2
            size={24}
            className="animate-spin text-primary-500"
          />
        </div>
      )}

      {apiRequest.state.isError && (
        <div className="card border border-error-100 bg-error-50 py-8 text-center">
          <p className="text-sm font-medium text-error-700">
            Failed to load schedule requirements. Please try again.
          </p>
        </div>
      )}

      {apiRequest.state.data && apiRequest.state.data.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
            <ClipboardList size={28} className="text-text-tertiary" />
          </div>
          <p className="font-heading text-base font-semibold text-text-secondary">
            No schedule requirements yet
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Add your first requirement using the button above.
          </p>
        </div>
      )}

      {apiRequest.state.data && apiRequest.state.data.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken">
                <th className="px-6 py-3.5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Date Reference
                </th>
                <th className="px-6 py-3.5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Requirements
                </th>
                <th className="px-6 py-3.5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {apiRequest.state.data.map((requirement, index) => (
                <ScheduleRequirementRow
                  key={requirement.id}
                  requirement={requirement}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleEnabled={handleToggleEnabled}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentActiveDialog === 'edit' && state.selectedRequirement && (
        <EditScheduleRequirementDialog
          requirement={state.selectedRequirement}
          onClose={handleCloseDialog}
          onSuccess={handleMutationSuccess}
        />
      )}

      {currentActiveDialog === 'delete' && state.selectedRequirement && (
        <DeleteScheduleRequirementDialog
          requirement={state.selectedRequirement}
          onDelete={handleMutationSuccess}
        />
      )}
    </>
  )
}
