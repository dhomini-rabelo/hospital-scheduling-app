import { Select } from '@/components/ui/Select'
import { useAPIRequest } from '@/layout/hooks/useAPIRequest'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import type { TeamMember } from '@/server/types/entities'
import {
  PROFESSION_LABELS,
  Profession,
} from '@/server/types/entities'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { EditTeamMemberDialog } from '../EditTeamMemberDialog'
import { DeleteTeamMemberDialog } from './DeleteTeamMemberDialog'
import { TeamMemberRow } from './TeamMemberRow'

const PROFESSION_FILTER_OPTIONS = [
  { value: '', label: 'All Professions' },
  ...Object.values(Profession).map((value) => ({
    value,
    label: PROFESSION_LABELS[value],
  })),
]

interface TeamMemberListState {
  professionFilter: string
  selectedMember: TeamMember | null
}

export function TeamMemberList() {
  const [state, setState] = useState<TeamMemberListState>({
    professionFilter: '',
    selectedMember: null,
  })
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'edit' | 'delete'>()

  const apiRequest = useAPIRequest<TeamMember[]>({
    url: API_ROUTES.teamMembers.list,
    params: state.professionFilter
      ? { profession: state.professionFilter }
      : undefined,
  })

  function handleEdit(teamMember: TeamMember) {
    setState((previousState) => ({
      ...previousState,
      selectedMember: teamMember,
    }))
    activateDialog('edit')
  }

  function handleDelete(teamMember: TeamMember) {
    setState((previousState) => ({
      ...previousState,
      selectedMember: teamMember,
    }))
    activateDialog('delete')
  }

  function handleCloseDialog() {
    disableDialog()
    setState((previousState) => ({
      ...previousState,
      selectedMember: null,
    }))
  }

  function handleMutationSuccess() {
    handleCloseDialog()
    apiRequest.actions.refetch()
  }

  function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setState((previousState) => ({
      ...previousState,
      professionFilter: event.target.value,
    }))
  }

  return (
    <>
      <div className="flex justify-end">
        <div className="w-48">
          <Select
            options={PROFESSION_FILTER_OPTIONS}
            value={state.professionFilter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {apiRequest.state.isLoading && (
        <p className="text-body-sm text-text-secondary">Loading...</p>
      )}

      {apiRequest.state.isError && (
        <p className="text-body-sm text-error-600">
          Failed to load team members.
        </p>
      )}

      {apiRequest.state.data && apiRequest.state.data.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Users size={40} className="mb-3 text-text-tertiary" />
          <p className="text-body text-text-secondary">
            No team members found.
          </p>
          <p className="text-body-sm text-text-tertiary">
            Add team members using the form above.
          </p>
        </div>
      )}

      {apiRequest.state.data && apiRequest.state.data.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Profession
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Specialty
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="px-5">
              {apiRequest.state.data.map((teamMember) => (
                <TeamMemberRow
                  key={teamMember.id}
                  teamMember={teamMember}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentActiveDialog === 'edit' && state.selectedMember && (
        <EditTeamMemberDialog
          teamMember={state.selectedMember}
          onClose={handleCloseDialog}
          onSuccess={handleMutationSuccess}
        />
      )}

      {currentActiveDialog === 'delete' && state.selectedMember && (
        <DeleteTeamMemberDialog
          teamMember={state.selectedMember}
          onDelete={handleMutationSuccess}
        />
      )}
    </>
  )
}
