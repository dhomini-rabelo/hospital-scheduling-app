import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteTeamMember } from '@/server/api/team-members'
import type { TeamMember } from '@/server/types/entities'
import { useState } from 'react'

interface DeleteTeamMemberDialogState {
  isDeleting: boolean
}

interface DeleteTeamMemberDialogProps {
  teamMember: TeamMember
  onDelete: () => void
}

export function DeleteTeamMemberDialog({
  teamMember,
  onDelete,
}: DeleteTeamMemberDialogProps) {
  const [state, setState] = useState<DeleteTeamMemberDialogState>({
    isDeleting: false,
  })

  async function handleConfirmDelete() {
    try {
      setState({ isDeleting: true })
      await deleteTeamMember(teamMember.id)
      onDelete()
    } catch {
      setState({ isDeleting: false })
    }
  }

  return (
    <ConfirmDialog
      title="Delete Team Member"
      message={`Are you sure you want to delete ${teamMember.name}? This action cannot be undone.`}
      onConfirm={handleConfirmDelete}
      onCancel={onDelete}
      isLoading={state.isDeleting}
    />
  )
}
