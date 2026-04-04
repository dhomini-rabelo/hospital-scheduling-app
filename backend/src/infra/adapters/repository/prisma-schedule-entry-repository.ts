import {
  CreateScheduleEntryInput,
  ScheduleEntryRepository,
  ScheduleEntryWithAggregateData,
  UpdateScheduleEntryInput,
} from '@/adapters/repositories/schedule-entry-repository'
import {
  ScheduleEntry,
  StructureDataJsonField,
} from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryScheduleRequirementMap } from '@/domain/entities/schedule-entry/schedule-entry-schedule-requirement-map'
import { ScheduleEntryTeamMemberMap } from '@/domain/entities/schedule-entry/schedule-entry-team-member-map'
import { ScheduleEntryScheduleRequirementMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-schedule-requirement-map'
import { ScheduleEntryTeamMemberMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-team-member-map'
import {
  RequirementsDataJsonField,
  ScheduleRequirement,
} from '@/domain/entities/schedule-requirement'
import {
  Profession,
  Specialty,
  TeamMember,
} from '@/domain/entities/team-member'
import { prisma } from '@/infra/services/prisma'

type PrismaScheduleEntryRecord = {
  id: string
  date: string
  structure: string
  createdAt: Date
  updatedAt: Date
  teamMembers: {
    id: string
    scheduleEntryId: string
    teamMemberId: string
    createdAt: Date
    updatedAt: Date
  }[]
  scheduleRequirements: {
    id: string
    scheduleEntryId: string
    scheduleRequirementId: string
    createdAt: Date
    updatedAt: Date
  }[]
}

type PrismaScheduleEntryWithAggregateRecords = {
  id: string
  date: string
  structure: string
  createdAt: Date
  updatedAt: Date
  teamMembers: {
    id: string
    scheduleEntryId: string
    teamMemberId: string
    createdAt: Date
    updatedAt: Date
    teamMember: {
      id: string
      name: string
      profession: string
      specialty: string
      createdAt: Date
      updatedAt: Date
    }
  }[]
  scheduleRequirements: {
    id: string
    scheduleEntryId: string
    scheduleRequirementId: string
    createdAt: Date
    updatedAt: Date
    scheduleRequirement: {
      id: string
      dateReference: string
      requirements: string
      isEnabled: boolean
      createdAt: Date
      updatedAt: Date
    }
  }[]
}

function toEntity(record: PrismaScheduleEntryRecord): ScheduleEntry {
  const teamMemberMaps = record.teamMembers.map((tm) =>
    ScheduleEntryTeamMemberMap.reference(tm.id, {
      scheduleEntryId: tm.scheduleEntryId,
      teamMemberId: tm.teamMemberId,
      createdAt: tm.createdAt,
      updatedAt: tm.updatedAt,
    }),
  )

  const scheduleRequirementMaps = record.scheduleRequirements.map((sr) =>
    ScheduleEntryScheduleRequirementMap.reference(sr.id, {
      scheduleEntryId: sr.scheduleEntryId,
      scheduleRequirementId: sr.scheduleRequirementId,
      createdAt: sr.createdAt,
      updatedAt: sr.updatedAt,
    }),
  )

  return ScheduleEntry.reference(record.id, {
    date: record.date,
    structure: StructureDataJsonField.create(JSON.parse(record.structure)),
    teamMembers: new ScheduleEntryTeamMemberMapWatchedList(teamMemberMaps),
    scheduleRequirements: new ScheduleEntryScheduleRequirementMapWatchedList(
      scheduleRequirementMaps,
    ),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function toTeamMemberEntity(record: {
  id: string
  name: string
  profession: string
  specialty: string
  createdAt: Date
  updatedAt: Date
}): TeamMember {
  return TeamMember.reference(record.id, {
    name: record.name,
    profession: record.profession as Profession,
    specialty: record.specialty as Specialty,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function toScheduleRequirementEntity(record: {
  id: string
  dateReference: string
  requirements: string
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}): ScheduleRequirement {
  return ScheduleRequirement.reference(record.id, {
    dateReference: record.dateReference,
    requirements: RequirementsDataJsonField.create(
      JSON.parse(record.requirements),
    ),
    isEnabled: record.isEnabled,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

function toAggregateData(
  record: PrismaScheduleEntryWithAggregateRecords,
): ScheduleEntryWithAggregateData {
  const scheduleEntry = toEntity(record)
  const teamMembers = record.teamMembers.map((tm) =>
    toTeamMemberEntity(tm.teamMember),
  )
  const scheduleRequirements = record.scheduleRequirements.map((sr) =>
    toScheduleRequirementEntity(sr.scheduleRequirement),
  )

  return { scheduleEntry, teamMembers, scheduleRequirements }
}

const includeBase = {
  teamMembers: true,
  scheduleRequirements: true,
} as const

const includeAggregate = {
  teamMembers: {
    include: { teamMember: true },
  },
  scheduleRequirements: {
    include: { scheduleRequirement: true },
  },
} as const

export class PrismaScheduleEntryRepository implements ScheduleEntryRepository {
  async create(input: CreateScheduleEntryInput): Promise<ScheduleEntry> {
    const record = await prisma.scheduleEntry.create({
      data: {
        date: input.date,
        structure: input.structure.toValue(),
        teamMembers: {
          create: input.teamMembers.getItems().map((mapItem) => ({
            teamMemberId: mapItem.props.teamMemberId,
          })),
        },
        scheduleRequirements: {
          create: input.scheduleRequirements.getItems().map((mapItem) => ({
            scheduleRequirementId: mapItem.props.scheduleRequirementId,
          })),
        },
      },
      include: includeBase,
    })

    return toEntity(record)
  }

  async findById(id: string): Promise<ScheduleEntry | null> {
    const record = await prisma.scheduleEntry.findUnique({
      where: { id },
      include: includeBase,
    })
    if (!record) return null

    return toEntity(record)
  }

  async findByDate(date: string): Promise<ScheduleEntry | null> {
    const record = await prisma.scheduleEntry.findUnique({
      where: { date },
      include: includeBase,
    })
    if (!record) return null

    return toEntity(record)
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ScheduleEntry[]> {
    const records = await prisma.scheduleEntry.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: includeBase,
      orderBy: { date: 'asc' },
    })

    return records.map(toEntity)
  }

  async update(
    id: string,
    input: UpdateScheduleEntryInput,
  ): Promise<ScheduleEntry> {
    const removedTeamMembers = input.teamMembers.getRemovedItems()
    const newTeamMembers = input.teamMembers.getNewItems()
    const removedRequirements = input.scheduleRequirements.getRemovedItems()
    const newRequirements = input.scheduleRequirements.getNewItems()

    await prisma.$transaction(async (tx) => {
      if (removedTeamMembers.length > 0) {
        await tx.scheduleEntryTeamMemberMap.deleteMany({
          where: { id: { in: removedTeamMembers.map((item) => item.id) } },
        })
      }

      if (newTeamMembers.length > 0) {
        await tx.scheduleEntryTeamMemberMap.createMany({
          data: newTeamMembers.map((item) => ({
            scheduleEntryId: id,
            teamMemberId: item.props.teamMemberId,
          })),
        })
      }

      if (removedRequirements.length > 0) {
        await tx.scheduleEntryScheduleRequirementMap.deleteMany({
          where: { id: { in: removedRequirements.map((item) => item.id) } },
        })
      }

      if (newRequirements.length > 0) {
        await tx.scheduleEntryScheduleRequirementMap.createMany({
          data: newRequirements.map((item) => ({
            scheduleEntryId: id,
            scheduleRequirementId: item.props.scheduleRequirementId,
          })),
        })
      }

      await tx.scheduleEntry.update({
        where: { id },
        data: { structure: input.structure.toValue() },
      })
    })

    const updatedRecord = await prisma.scheduleEntry.findUniqueOrThrow({
      where: { id },
      include: includeBase,
    })

    return toEntity(updatedRecord)
  }

  async delete(id: string): Promise<void> {
    await prisma.scheduleEntry.delete({ where: { id } })
  }

  async getWithAggregateData(
    date: string,
  ): Promise<ScheduleEntryWithAggregateData | null> {
    const record = await prisma.scheduleEntry.findUnique({
      where: { date },
      include: includeAggregate,
    })
    if (!record) return null

    return toAggregateData(record)
  }

  async listWithAggregateData(
    startDate: string,
    endDate: string,
  ): Promise<ScheduleEntryWithAggregateData[]> {
    const records = await prisma.scheduleEntry.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: includeAggregate,
      orderBy: { date: 'asc' },
    })

    return records.map(toAggregateData)
  }
}
