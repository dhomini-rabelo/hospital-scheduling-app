import { RequirementsData } from '@/domain/entities/schedule-requirement'
import {
  Profession,
  PROFESSION_SPECIALTIES,
} from '@/domain/entities/team-member'
import { ValidationError } from '@/modules/domain/errors'

export function validateRequirementsData(requirements: RequirementsData) {
  if (requirements.length === 0) {
    throw new ValidationError({
      errorField: 'requirements',
      code: 'REQUIREMENTS_MUST_NOT_BE_EMPTY',
    })
  }

  const professionValues = Object.values(Profession) as string[]
  const seenProfessions = new Set<string>()

  for (const professionRequirement of requirements) {
    if (!professionValues.includes(professionRequirement.profession)) {
      throw new ValidationError({
        errorField: 'requirements.profession',
        code: 'INVALID_PROFESSION',
        variables: [professionRequirement.profession],
      })
    }

    if (seenProfessions.has(professionRequirement.profession)) {
      throw new ValidationError({
        errorField: 'requirements.profession',
        code: 'DUPLICATE_PROFESSION',
        variables: [professionRequirement.profession],
      })
    }
    seenProfessions.add(professionRequirement.profession)

    const validSpecialties =
      PROFESSION_SPECIALTIES[professionRequirement.profession as Profession]
    const seenSpecialties = new Set<string>()

    for (const specialtyRequirement of professionRequirement.specialtyRequirements) {
      if (!validSpecialties.includes(specialtyRequirement.specialty)) {
        throw new ValidationError({
          errorField: 'requirements.specialtyRequirements.specialty',
          code: 'INVALID_SPECIALTY_FOR_PROFESSION',
          variables: [
            professionRequirement.profession,
            specialtyRequirement.specialty,
          ],
        })
      }

      if (seenSpecialties.has(specialtyRequirement.specialty)) {
        throw new ValidationError({
          errorField: 'requirements.specialtyRequirements.specialty',
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
        errorField: 'requirements.specialtyRequirements',
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
