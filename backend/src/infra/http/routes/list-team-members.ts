import { Profession } from '@/domain/entities/team-member'
import { ListTeamMembersUseCase } from '@/domain/use-cases/team-member/list-team-members'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const listTeamMembersSchema = z.object({
  profession: z.nativeEnum(Profession).optional(),
})

export async function listTeamMembers(req: Request, res: Response) {
  const query = listTeamMembersSchema.parse(req.query)

  const repository = new PrismaTeamMemberRepository()
  const useCase = new ListTeamMembersUseCase(repository)
  const { items } = await useCase.execute({
    profession: query.profession,
  })

  return res.status(200).json(items.map(presentTeamMember))
}
