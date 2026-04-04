import { API_ROUTES } from '@/server/routes'
import { useQueryClient } from '@tanstack/react-query'
import { TeamMemberForm } from './components/TeamMemberForm/TeamMemberForm'
import { TeamMemberList } from './components/TeamMemberList/TeamMemberList'

export function TeamMembers() {
  const queryClient = useQueryClient()

  function handleMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: [API_ROUTES.teamMembers.list] })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-2">Team Members</h1>
      <TeamMemberForm onSuccess={handleMutationSuccess} />
      <TeamMemberList />
    </div>
  )
}
