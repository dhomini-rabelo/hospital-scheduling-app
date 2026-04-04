import { API_ROUTES } from '@/server/routes'
import { useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { TeamMemberForm } from './components/TeamMemberForm/TeamMemberForm'
import { TeamMemberList } from './components/TeamMemberList/TeamMemberList'

export function TeamMembers() {
  const queryClient = useQueryClient()

  function handleMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: [API_ROUTES.teamMembers.list] })
  }

  return (
    <div className="flex flex-col gap-8">
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
      <TeamMemberForm onSuccess={handleMutationSuccess} />
      <TeamMemberList />
    </div>
  )
}
