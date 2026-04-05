import {
  ScheduleEntry,
  StructureData,
} from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryTeamMemberMap } from '@/domain/entities/schedule-entry/schedule-entry-team-member-map'
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
  const unreservedCounts = new Map<string, number>()

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
    } else {
      const reservedSlots = professionReq.specialtyRequirements.reduce(
        (acc, sr) => acc + sr.requiredCount,
        0,
      )
      const unreservedCapacity = professionReq.requiredCount - reservedSlots
      const currentUnreservedCount =
        (unreservedCounts.get(teamMember.props.profession) ?? 0) + 1
      unreservedCounts.set(teamMember.props.profession, currentUnreservedCount)

      if (currentUnreservedCount > unreservedCapacity) {
        throw new ValidationError({
          errorField: 'teamMemberIds',
          code: 'NO_AVAILABLE_SLOT_FOR_SPECIALTY',
          variables: [
            teamMember.props.name,
            teamMember.props.profession,
            teamMember.props.specialty,
          ],
        })
      }
    }
  }
}

export function validateTeamMemberIsAssignedToEntry(
  entry: ScheduleEntry,
  teamMemberId: string,
): ScheduleEntryTeamMemberMap {
  const mapEntity = entry.props.teamMembers
    .getItems()
    .find((item) => item.props.teamMemberId === teamMemberId)

  if (!mapEntity) {
    throw new ValidationError({
      errorField: 'teamMemberId',
      code: 'TEAM_MEMBER_NOT_ASSIGNED_TO_ENTRY',
      variables: [teamMemberId],
    })
  }

  return mapEntity
}

export function determineIsSpecialtySlot(
  structure: Readonly<StructureData>,
  assignedTeamMemberIds: string[],
  allProfessionTeamMembers: TeamMember[],
  targetMember: TeamMember,
): boolean {
  const profReq = structure.find(
    (p) => p.profession === targetMember.props.profession,
  )
  if (!profReq) return false

  const specReq = profReq.specialtyRequirements.find(
    (s) => s.specialty === targetMember.props.specialty,
  )
  if (!specReq) return false

  const assignedWithSpecialty = allProfessionTeamMembers.filter(
    (tm) =>
      tm.id !== targetMember.id &&
      tm.props.specialty === targetMember.props.specialty &&
      assignedTeamMemberIds.includes(tm.id),
  ).length

  return assignedWithSpecialty < specReq.requiredCount
}
