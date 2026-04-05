import { SwapTeamMemberUseCase } from '@/domain/use-cases/schedule-entry/swap-team-member'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentScheduleEntry } from '@/infra/http/presenters/schedule-entry-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const swapTeamMemberParamsSchema = z.object({
  entryId: z.string().uuid(),
})

const swapTeamMemberBodySchema = z.object({
  removeTeamMemberId: z.string().uuid(),
  addTeamMemberId: z.string().uuid(),
})

export async function swapTeamMember(req: Request, res: Response) {
  const params = swapTeamMemberParamsSchema.parse(req.params)
  const body = swapTeamMemberBodySchema.parse(req.body)

  const scheduleEntryRepository = new PrismaScheduleEntryRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const useCase = new SwapTeamMemberUseCase(
    scheduleEntryRepository,
    teamMemberRepository,
  )

  const { item } = await useCase.execute({
    entryId: params.entryId,
    removeTeamMemberId: body.removeTeamMemberId,
    addTeamMemberId: body.addTeamMemberId,
  })

  return res.status(200).json({
    entry: presentScheduleEntry(item),
  })
}
