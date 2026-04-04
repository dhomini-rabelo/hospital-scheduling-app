import {
  Profession,
  PROFESSION_SPECIALTIES,
} from '@/domain/entities/team-member'
import { ValidationError } from '@/modules/domain/errors'

export function validateSpecialtyForProfession(
  profession: Profession,
  specialty: string,
) {
  if (!PROFESSION_SPECIALTIES[profession].includes(specialty)) {
    throw new ValidationError({
      errorField: 'specialty',
      code: 'INVALID_SPECIALTY_FOR_PROFESSION',
      variables: [profession, specialty],
    })
  }
}
