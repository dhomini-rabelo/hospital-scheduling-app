import { Button } from '@/components/ui/Button'
import { useDialogs } from '@/layout/hooks/useDialogs'
import { API_ROUTES } from '@/server/routes'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { CreateTeamMemberDialog } from './components/TeamMemberForm/CreateTeamMemberDialog'
import { TeamMemberList } from './components/TeamMemberList/TeamMemberList'

export function TeamMembers() {
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<'create'>()
  const queryClient = useQueryClient()

  function handleMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: [API_ROUTES.teamMembers.list] })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Users size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-heading-2">Team Members</h1>
            <p className="text-sm text-text-tertiary">
              Manage your hospital staff and specialties
            </p>
          </div>
        </div>
        <Button onClick={() => activateDialog('create')}>
          <Plus size={16} />
          Add Members
        </Button>
      </div>
      {currentActiveDialog === 'create' && (
        <CreateTeamMemberDialog
          onClose={disableDialog}
          onSuccess={handleMutationSuccess}
        />
      )}
      <TeamMemberList />
    </div>
  )
}
