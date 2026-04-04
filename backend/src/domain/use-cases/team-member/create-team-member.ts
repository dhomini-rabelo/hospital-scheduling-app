import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import { validateSpecialtyForProfession } from '@/domain/utils/team-member'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  name: string
  profession: Profession
  specialty: Specialty
}

interface Response {
  item: TeamMember
}

export class CreateTeamMemberUseCase implements UseCase<Response> {
  constructor(private teamMemberRepository: TeamMemberRepository) {}

  async execute(payload: Payload): Promise<Response> {
    validateSpecialtyForProfession(payload.profession, payload.specialty)

    const item = await this.teamMemberRepository.create({
      name: payload.name,
      profession: payload.profession,
      specialty: payload.specialty,
    })

    return { item }
  }
}
