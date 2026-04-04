import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import { validateSpecialtyForProfession } from '@/domain/utils/team-member'
import { DangerErrors, DomainError } from '@/modules/domain/errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  id: string
  name?: string
  profession?: Profession
  specialty?: Specialty
}

interface Response {
  item: TeamMember
}

export class UpdateTeamMemberUseCase implements UseCase<Response> {
  constructor(private teamMemberRepository: TeamMemberRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const teamMember = await this.teamMemberRepository.findById(payload.id)

    if (!teamMember) {
      throw new DomainError({
        errorType: DangerErrors.NOT_FOUND,
        code: 'TEAM_MEMBER_NOT_FOUND',
        variables: [payload.id],
      })
    }

    const newProfession = payload.profession ?? teamMember.props.profession
    const newSpecialty = payload.specialty ?? teamMember.props.specialty

    if (payload.profession !== undefined || payload.specialty !== undefined) {
      validateSpecialtyForProfession(newProfession, newSpecialty)
    }

    const item = await this.teamMemberRepository.update(payload.id, {
      name: payload.name,
      profession: payload.profession,
      specialty: payload.specialty,
    })

    return { item }
  }
}
