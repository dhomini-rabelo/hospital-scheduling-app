import { TeamMember } from '@/domain/entities/team-member'

export function presentTeamMember(teamMember: TeamMember) {
  return {
    id: teamMember.id,
    name: teamMember.props.name,
    profession: teamMember.props.profession,
    specialty: teamMember.props.specialty,
    createdAt: teamMember.props.createdAt.toISOString(),
    updatedAt: teamMember.props.updatedAt.toISOString(),
  }
}
