import { ListSwapCandidatesUseCase } from '@/domain/use-cases/schedule-entry/list-swap-candidates'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const listSwapCandidatesParamsSchema = z.object({
  entryId: z.string().uuid(),
  teamMemberId: z.string().uuid(),
})

export async function listSwapCandidates(req: Request, res: Response) {
  const params = listSwapCandidatesParamsSchema.parse(req.params)

  const scheduleEntryRepository = new PrismaScheduleEntryRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const useCase = new ListSwapCandidatesUseCase(
    scheduleEntryRepository,
    teamMemberRepository,
  )

  const { swapContext, candidates } = await useCase.execute({
    entryId: params.entryId,
    teamMemberId: params.teamMemberId,
  })

  return res.status(200).json({
    swapContext,
    candidates: candidates.map((candidate) => ({
      teamMember: presentTeamMember(candidate.teamMember),
      weekAssignmentCount: candidate.weekAssignmentCount,
    })),
  })
}
