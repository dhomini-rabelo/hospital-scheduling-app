import { DeleteTeamMemberUseCase } from '@/domain/use-cases/team-member/delete-team-member'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { Request, Response } from 'express'
import { z } from 'zod'

const deleteTeamMemberParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteTeamMember(req: Request, res: Response) {
  const { id } = deleteTeamMemberParamsSchema.parse(req.params)

  const repository = new PrismaTeamMemberRepository()
  const useCase = new DeleteTeamMemberUseCase(repository)
  await useCase.execute({ id })

  return res.status(204).send()
}
