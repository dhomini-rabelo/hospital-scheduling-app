import { Select } from '@/components/ui/Select'
import { useAPIRequest } from '@/layout/hooks/useAPIRequest'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import type { TeamMember } from '@/server/types/entities'
import {
  PROFESSION_LABELS,
  Profession,
} from '@/server/types/entities'
import { Loader2, Users } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Staff Directory
        </h2>
        <div className="w-48">
          <Select
            options={PROFESSION_FILTER_OPTIONS}
            value={state.professionFilter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

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
            Failed to load team members. Please try again.
          </p>
        </div>
      )}

      {apiRequest.state.data && apiRequest.state.data.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
            <Users size={28} className="text-text-tertiary" />
          </div>
          <p className="font-heading text-base font-semibold text-text-secondary">
            No team members yet
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Add your first team member using the form above.
          </p>
        </div>
      )}

      {apiRequest.state.data && apiRequest.state.data.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-sunken">
                <th className="px-6 py-3.5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Profession
                </th>
                <th className="px-6 py-3.5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Specialty
                </th>
                <th className="px-6 py-3.5 text-right font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {apiRequest.state.data.map((teamMember, index) => (
                <TeamMemberRow
                  key={teamMember.id}
                  teamMember={teamMember}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={index}
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
