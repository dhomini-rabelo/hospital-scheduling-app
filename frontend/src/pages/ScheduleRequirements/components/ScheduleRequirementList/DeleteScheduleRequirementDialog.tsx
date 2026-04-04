import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteScheduleRequirement } from '@/server/api/schedule-requirements'
import type { ScheduleRequirement } from '@/server/types/entities'
import { useState } from 'react'

interface DeleteScheduleRequirementDialogState {
  isDeleting: boolean
}

interface DeleteScheduleRequirementDialogProps {
  requirement: ScheduleRequirement
  onDelete: () => void
}

export function DeleteScheduleRequirementDialog({
  requirement,
  onDelete,
}: DeleteScheduleRequirementDialogProps) {
  const [state, setState] =
    useState<DeleteScheduleRequirementDialogState>({
      isDeleting: false,
    })

  async function handleConfirmDelete() {
    try {
      setState({ isDeleting: true })
      await deleteScheduleRequirement(requirement.id)
      onDelete()
    } catch {
      setState({ isDeleting: false })
    }
  }

  return (
    <ConfirmDialog
      title="Delete Schedule Requirement"
      message={`Are you sure you want to delete the requirement for "${requirement.dateReference}"? This action cannot be undone.`}
      onConfirm={handleConfirmDelete}
      onCancel={onDelete}
      isLoading={state.isDeleting}
    />
  )
}
