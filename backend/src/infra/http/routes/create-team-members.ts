import { Profession, Specialty } from '@/domain/entities/team-member'
import { CreateTeamMembersUseCase } from '@/domain/use-cases/team-member/create-team-members'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const createTeamMembersSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        profession: z.nativeEnum(Profession),
        specialty: z.string().min(1),
      }),
    )
    .min(1),
})

export async function createTeamMembers(req: Request, res: Response) {
  const payload = createTeamMembersSchema.parse(req.body)

  const repository = new PrismaTeamMemberRepository()
  const useCase = new CreateTeamMembersUseCase(repository)
  const { items } = await useCase.execute({
    items: payload.items.map((item) => ({
      name: item.name,
      profession: item.profession,
      specialty: item.specialty as Specialty,
    })),
  })

  return res.status(201).json(items.map(presentTeamMember))
}
