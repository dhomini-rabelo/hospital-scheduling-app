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
import { ScheduleEntryTeamMemberMap } from '@/domain/entities/schedule-entry/schedule-entry-team-member-map'
import { ScheduleEntryTeamMemberMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-team-member-map'
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
}

type PrismaScheduleEntryWithTeamMemberRecords = {
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

  return ScheduleEntry.reference(record.id, {
    date: record.date,
    structure: StructureDataJsonField.create(JSON.parse(record.structure)),
    teamMembers: new ScheduleEntryTeamMemberMapWatchedList(teamMemberMaps),
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

function toAggregateData(
  record: PrismaScheduleEntryWithTeamMemberRecords,
): ScheduleEntryWithAggregateData {
  const scheduleEntry = toEntity(record)
  const teamMembers = record.teamMembers.map((tm) =>
    toTeamMemberEntity(tm.teamMember),
  )

  return { scheduleEntry, teamMembers }
}

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
      },
      include: {
        teamMembers: true,
      },
    })

    return toEntity(record)
  }

  async findById(id: string): Promise<ScheduleEntry | null> {
    const record = await prisma.scheduleEntry.findUnique({
      where: { id },
      include: { teamMembers: true },
    })
    if (!record) return null

    return toEntity(record)
  }

  async findByDate(date: string): Promise<ScheduleEntry | null> {
    const record = await prisma.scheduleEntry.findUnique({
      where: { date },
      include: { teamMembers: true },
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
      include: { teamMembers: true },
      orderBy: { date: 'asc' },
    })

    return records.map(toEntity)
  }

  async update(
    id: string,
    input: UpdateScheduleEntryInput,
  ): Promise<ScheduleEntry> {
    const removedItems = input.teamMembers.getRemovedItems()
    const newItems = input.teamMembers.getNewItems()

    await prisma.$transaction(async (tx) => {
      if (removedItems.length > 0) {
        await tx.scheduleEntryTeamMemberMap.deleteMany({
          where: { id: { in: removedItems.map((item) => item.id) } },
        })
      }

      if (newItems.length > 0) {
        await tx.scheduleEntryTeamMemberMap.createMany({
          data: newItems.map((item) => ({
            scheduleEntryId: id,
            teamMemberId: item.props.teamMemberId,
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
      include: { teamMembers: true },
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
      include: {
        teamMembers: {
          include: { teamMember: true },
        },
      },
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
      include: {
        teamMembers: {
          include: { teamMember: true },
        },
      },
      orderBy: { date: 'asc' },
    })

    return records.map(toAggregateData)
  }
}
