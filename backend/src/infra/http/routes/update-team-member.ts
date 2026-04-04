import { Profession, Specialty } from '@/domain/entities/team-member'
import { UpdateTeamMemberUseCase } from '@/domain/use-cases/team-member/update-team-member'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const updateTeamMemberParamsSchema = z.object({
  id: z.string().uuid(),
})

const updateTeamMemberBodySchema = z.object({
  name: z.string().min(1).optional(),
  profession: z.nativeEnum(Profession).optional(),
  specialty: z.string().min(1).optional(),
})

export async function updateTeamMember(req: Request, res: Response) {
  const { id } = updateTeamMemberParamsSchema.parse(req.params)
  const body = updateTeamMemberBodySchema.parse(req.body)

  const repository = new PrismaTeamMemberRepository()
  const useCase = new UpdateTeamMemberUseCase(repository)
  const { item } = await useCase.execute({
    id,
    name: body.name,
    profession: body.profession,
    specialty: body.specialty as Specialty | undefined,
  })

  return res.status(200).json(presentTeamMember(item))
}
