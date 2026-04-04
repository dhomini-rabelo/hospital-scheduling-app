import { StructureData } from '@/domain/entities/schedule-entry/schedule-entry'
import {
  Profession,
  PROFESSION_SPECIALTIES,
  TeamMember,
} from '@/domain/entities/team-member'
import { ValidationError } from '@/modules/domain/errors'

export function validateStructureData(structure: StructureData) {
  if (structure.length === 0) {
    throw new ValidationError({
      errorField: 'structure',
      code: 'STRUCTURE_MUST_NOT_BE_EMPTY',
    })
  }

  const professionValues = Object.values(Profession) as string[]
  const seenProfessions = new Set<string>()

  for (const professionRequirement of structure) {
    if (!professionValues.includes(professionRequirement.profession)) {
      throw new ValidationError({
        errorField: 'structure.profession',
        code: 'INVALID_PROFESSION',
        variables: [professionRequirement.profession],
      })
    }

    if (seenProfessions.has(professionRequirement.profession)) {
      throw new ValidationError({
        errorField: 'structure.profession',
        code: 'DUPLICATE_PROFESSION',
        variables: [professionRequirement.profession],
      })
    }
    seenProfessions.add(professionRequirement.profession)

    const validSpecialties =
      PROFESSION_SPECIALTIES[professionRequirement.profession]
    const seenSpecialties = new Set<string>()

    for (const specialtyRequirement of professionRequirement.specialtyRequirements) {
      if (!validSpecialties.includes(specialtyRequirement.specialty)) {
        throw new ValidationError({
          errorField: 'structure.specialtyRequirements.specialty',
          code: 'INVALID_SPECIALTY_FOR_PROFESSION',
          variables: [
            professionRequirement.profession,
            specialtyRequirement.specialty,
          ],
        })
      }

      if (seenSpecialties.has(specialtyRequirement.specialty)) {
        throw new ValidationError({
          errorField: 'structure.specialtyRequirements.specialty',
          code: 'DUPLICATE_SPECIALTY',
          variables: [specialtyRequirement.specialty],
        })
      }
      seenSpecialties.add(specialtyRequirement.specialty)
    }

    const specialtySum = professionRequirement.specialtyRequirements.reduce(
      (acc, item) => acc + item.requiredCount,
      0,
    )

    if (specialtySum > professionRequirement.requiredCount) {
      throw new ValidationError({
        errorField: 'structure.specialtyRequirements',
        code: 'SPECIALTY_SUM_EXCEEDS_REQUIRED_COUNT',
        variables: [
          professionRequirement.profession,
          String(specialtySum),
          String(professionRequirement.requiredCount),
        ],
      })
    }
  }
}

export function validateTeamMembersAgainstStructure(
  teamMembers: TeamMember[],
  structure: StructureData,
) {
  const structureByProfession = new Map(
    structure.map((item) => [item.profession, item]),
  )

  const professionCounts = new Map<string, number>()
  const specialtyCounts = new Map<string, number>()

  for (const teamMember of teamMembers) {
    const professionReq = structureByProfession.get(teamMember.props.profession)

    if (!professionReq) {
      throw new ValidationError({
        errorField: 'teamMemberIds',
        code: 'TEAM_MEMBER_PROFESSION_NOT_IN_STRUCTURE',
        variables: [teamMember.props.name, teamMember.props.profession],
      })
    }

    const currentProfessionCount =
      (professionCounts.get(teamMember.props.profession) ?? 0) + 1
    professionCounts.set(teamMember.props.profession, currentProfessionCount)

    if (currentProfessionCount > professionReq.requiredCount) {
      throw new ValidationError({
        errorField: 'teamMemberIds',
        code: 'PROFESSION_COUNT_EXCEEDS_STRUCTURE',
        variables: [
          teamMember.props.profession,
          String(currentProfessionCount),
          String(professionReq.requiredCount),
        ],
      })
    }

    const specialtyReq = professionReq.specialtyRequirements.find(
      (sr) => sr.specialty === teamMember.props.specialty,
    )

    if (specialtyReq) {
      const specialtyKey = `${teamMember.props.profession}:${teamMember.props.specialty}`
      const currentSpecialtyCount = (specialtyCounts.get(specialtyKey) ?? 0) + 1
      specialtyCounts.set(specialtyKey, currentSpecialtyCount)

      if (currentSpecialtyCount > specialtyReq.requiredCount) {
        throw new ValidationError({
          errorField: 'teamMemberIds',
          code: 'SPECIALTY_COUNT_EXCEEDS_STRUCTURE',
          variables: [
            teamMember.props.specialty,
            String(currentSpecialtyCount),
            String(specialtyReq.requiredCount),
          ],
        })
      }
    }
  }
}
