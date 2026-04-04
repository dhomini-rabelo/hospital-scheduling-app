import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  id: string
}

export class DeleteTeamMemberUseCase implements UseCase<void> {
  constructor(private teamMemberRepository: TeamMemberRepository) {}

  async execute(payload: Payload): Promise<void> {
    const teamMember = await this.teamMemberRepository.findById(payload.id)

    if (!teamMember) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'TEAM_MEMBER_NOT_FOUND',
        variables: [payload.id],
      })
    }

    await this.teamMemberRepository.delete(payload.id)
  }
}
