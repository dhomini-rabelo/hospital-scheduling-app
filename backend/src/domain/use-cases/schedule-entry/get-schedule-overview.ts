import {
  ScheduleEntryRepository,
  ScheduleEntryWithAggregateData,
} from '@/adapters/repositories/schedule-entry-repository'
import { ScheduleRequirementRepository } from '@/adapters/repositories/schedule-requirement-repository'
import {
  ProfessionRequirement,
  ScheduleRequirement,
} from '@/domain/entities/schedule-requirement'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import { getDateReferencesForDate } from '@/domain/utils/schedule'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  date: string
}

type SpecialtyFulfillment = {
  specialty: Specialty
  requiredCount: number
  assignedCount: number
  isFulfilled: boolean
}

type ProfessionFulfillment = {
  profession: Profession
  requiredCount: number
  assignedCount: number
  isFulfilled: boolean
  specialties: SpecialtyFulfillment[]
}

type StructureFulfillmentResult = {
  professions: ProfessionFulfillment[]
}

type RequirementFulfillmentResult = {
  requirementId: string
  dateReference: string
  isFulfilled: boolean
  professions: ProfessionFulfillment[]
}

export type ScheduleOverviewResult = {
  date: string
  totalAssigned: number
  entries: {
    id: string
    teamMember: TeamMember
  }[]
  scheduleRequirements: ScheduleRequirement[]
  structureFulfillment: StructureFulfillmentResult | null
  requirementsFulfillment: RequirementFulfillmentResult[]
}

interface Response {
  overview: ScheduleOverviewResult
}

function buildProfessionFulfillment(
  requirements: readonly ProfessionRequirement[],
  teamMembers: TeamMember[],
): ProfessionFulfillment[] {
  return requirements.map((profReq) => {
    const matchingMembers = teamMembers.filter(
      (tm) => tm.props.profession === profReq.profession,
    )

    const specialties = profReq.specialtyRequirements.map((specReq) => {
      const matchingSpecialists = matchingMembers.filter(
        (tm) => tm.props.specialty === specReq.specialty,
      )
      return {
        specialty: specReq.specialty,
        requiredCount: specReq.requiredCount,
        assignedCount: matchingSpecialists.length,
        isFulfilled: matchingSpecialists.length >= specReq.requiredCount,
      }
    })

    return {
      profession: profReq.profession,
      requiredCount: profReq.requiredCount,
      assignedCount: matchingMembers.length,
      isFulfilled: matchingMembers.length >= profReq.requiredCount,
      specialties,
    }
  })
}

export class GetScheduleOverviewUseCase implements UseCase<Response> {
  constructor(
    private scheduleEntryRepository: ScheduleEntryRepository,
    private scheduleRequirementRepository: ScheduleRequirementRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const aggregateData =
      await this.scheduleEntryRepository.getWithAggregateData(payload.date)

    const allRequirements = await this.scheduleRequirementRepository.findAll()
    const enabledRequirements = allRequirements.filter(
      (req) => req.props.isEnabled,
    )

    const dateReferences = getDateReferencesForDate(payload.date)
    const matchingRequirements = enabledRequirements.filter((req) =>
      dateReferences.includes(req.props.dateReference.toLowerCase()),
    )

    const teamMembers = aggregateData?.teamMembers ?? []

    const structureFulfillment = this.buildStructureFulfillment(
      aggregateData,
      teamMembers,
    )

    const requirementsFulfillment = this.buildRequirementsFulfillment(
      matchingRequirements,
      teamMembers,
    )

    const entries = aggregateData
      ? aggregateData.scheduleEntry.props.teamMembers
          .getItems()
          .map((mapItem) => {
            const teamMember = teamMembers.find(
              (tm) => tm.id === mapItem.props.teamMemberId,
            )!
            return { id: mapItem.id, teamMember }
          })
      : []

    return {
      overview: {
        date: payload.date,
        totalAssigned: teamMembers.length,
        entries,
        scheduleRequirements: aggregateData?.scheduleRequirements ?? [],
        structureFulfillment,
        requirementsFulfillment,
      },
    }
  }

  private buildStructureFulfillment(
    aggregateData: ScheduleEntryWithAggregateData | null,
    teamMembers: TeamMember[],
  ): StructureFulfillmentResult | null {
    if (!aggregateData) return null

    const structure = aggregateData.scheduleEntry.props.structure.value

    return {
      professions: buildProfessionFulfillment(structure, teamMembers),
    }
  }

  private buildRequirementsFulfillment(
    matchingRequirements: ScheduleRequirement[],
    teamMembers: TeamMember[],
  ): RequirementFulfillmentResult[] {
    return matchingRequirements.map((req) => {
      const professions = buildProfessionFulfillment(
        req.props.requirements.value,
        teamMembers,
      )

      const isFulfilled = professions.every(
        (p) => p.isFulfilled && p.specialties.every((s) => s.isFulfilled),
      )

      return {
        requirementId: req.id,
        dateReference: req.props.dateReference,
        isFulfilled,
        professions,
      }
    })
  }
}
