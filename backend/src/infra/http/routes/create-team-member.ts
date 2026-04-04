import { Profession, Specialty } from '@/domain/entities/team-member'
import { CreateTeamMemberUseCase } from '@/domain/use-cases/team-member/create-team-member'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const createTeamMemberSchema = z.object({
  name: z.string().min(1),
  profession: z.nativeEnum(Profession),
  specialty: z.string().min(1),
})

export async function createTeamMember(req: Request, res: Response) {
  const payload = createTeamMemberSchema.parse(req.body)

  const repository = new PrismaTeamMemberRepository()
  const useCase = new CreateTeamMemberUseCase(repository)
  const { item } = await useCase.execute({
    name: payload.name,
    profession: payload.profession,
    specialty: payload.specialty as Specialty,
  })

  return res.status(201).json(presentTeamMember(item))
}
