import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import { Profession, TeamMember } from '@/domain/entities/team-member'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  profession?: Profession
}

interface Response {
  items: TeamMember[]
}

export class ListTeamMembersUseCase implements UseCase<Response> {
  constructor(private teamMemberRepository: TeamMemberRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const items = await this.teamMemberRepository.findAll(payload.profession)
    return { items }
  }
}
