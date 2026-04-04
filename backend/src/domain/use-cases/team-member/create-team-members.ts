import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import { validateSpecialtyForProfession } from '@/domain/utils/team-member'
import { UseCase } from '@/modules/domain/use-case'

interface TeamMemberInput {
  name: string
  profession: Profession
  specialty: Specialty
}

interface Payload {
  items: TeamMemberInput[]
}

interface Response {
  items: TeamMember[]
}

export class CreateTeamMembersUseCase implements UseCase<Response> {
  constructor(private teamMemberRepository: TeamMemberRepository) {}

  async execute(payload: Payload): Promise<Response> {
    for (const member of payload.items) {
      validateSpecialtyForProfession(member.profession, member.specialty)
    }

    const items = await this.teamMemberRepository.createMany(
      payload.items.map((member) => ({
        name: member.name,
        profession: member.profession,
        specialty: member.specialty,
      })),
    )

    return { items }
  }
}
