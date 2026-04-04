import {
  CreateScheduleRequirementInput,
  ScheduleRequirementRepository,
  UpdateScheduleRequirementInput,
} from '@/adapters/repositories/schedule-requirement-repository'
import {
  RequirementsDataJsonField,
  ScheduleRequirement,
} from '@/domain/entities/schedule-requirement'
import { prisma } from '@/infra/services/prisma'

function toEntity(record: {
  id: string
  dateReference: string
  requirements: string
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}) {
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

export class PrismaScheduleRequirementRepository implements ScheduleRequirementRepository {
  async create(
    input: CreateScheduleRequirementInput,
  ): Promise<ScheduleRequirement> {
    const record = await prisma.scheduleRequirement.create({
      data: {
        dateReference: input.dateReference,
        requirements: input.requirements.toValue(),
        isEnabled: true,
      },
    })

    return toEntity(record)
  }

  async findById(id: string): Promise<ScheduleRequirement | null> {
    const record = await prisma.scheduleRequirement.findUnique({
      where: { id },
    })
    if (!record) return null

    return toEntity(record)
  }

  async findByDateReference(
    dateReference: string,
  ): Promise<ScheduleRequirement | null> {
    const record = await prisma.scheduleRequirement.findFirst({
      where: { dateReference },
    })
    if (!record) return null

    return toEntity(record)
  }

  async findAll(): Promise<ScheduleRequirement[]> {
    const records = await prisma.scheduleRequirement.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return records.map(toEntity)
  }

  async update(
    id: string,
    input: UpdateScheduleRequirementInput,
  ): Promise<ScheduleRequirement> {
    const record = await prisma.scheduleRequirement.update({
      where: { id },
      data: {
        requirements: input.requirements.toValue(),
      },
    })

    return toEntity(record)
  }

  async updateIsEnabled(
    id: string,
    isEnabled: boolean,
  ): Promise<ScheduleRequirement> {
    const record = await prisma.scheduleRequirement.update({
      where: { id },
      data: { isEnabled },
    })

    return toEntity(record)
  }

  async delete(id: string): Promise<void> {
    await prisma.scheduleRequirement.delete({ where: { id } })
  }
}
