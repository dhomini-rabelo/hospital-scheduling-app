import { TeamMemberRepository } from '@/adapters/repositories/team-member-repository'
import {
  Profession,
  Specialty,
  TeamMember,
  TeamMemberProps,
} from '@/domain/entities/team-member'
import { prisma } from '@/infra/services/prisma'

function toEntity(record: {
  id: string
  name: string
  profession: string
  specialty: string
  createdAt: Date
  updatedAt: Date
}) {
  return TeamMember.reference(record.id, {
    name: record.name,
    profession: record.profession as Profession,
    specialty: record.specialty as Specialty,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

export class PrismaTeamMemberRepository implements TeamMemberRepository {
  async create(
    props: Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>,
  ): Promise<TeamMember> {
    const record = await prisma.teamMember.create({
      data: {
        name: props.name,
        profession: props.profession,
        specialty: props.specialty,
      },
    })

    return toEntity(record)
  }

  async findById(id: string): Promise<TeamMember | null> {
    const record = await prisma.teamMember.findUnique({ where: { id } })
    if (!record) return null

    return toEntity(record)
  }

  async findAll(profession?: Profession): Promise<TeamMember[]> {
    const records = await prisma.teamMember.findMany({
      where: profession ? { profession } : undefined,
      orderBy: { name: 'asc' },
    })

    return records.map(toEntity)
  }

  async update(
    id: string,
    props: Partial<Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>>,
  ): Promise<TeamMember> {
    const record = await prisma.teamMember.update({
      where: { id },
      data: props,
    })

    return toEntity(record)
  }

  async delete(id: string): Promise<void> {
    await prisma.teamMember.delete({ where: { id } })
  }
}
