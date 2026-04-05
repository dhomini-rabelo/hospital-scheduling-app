import { AutoFillDayGapsUseCase } from '@/domain/use-cases/schedule-entry/auto-fill-day-gaps'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentScheduleEntry } from '@/infra/http/presenters/schedule-entry-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const autoFillDayGapsParamsSchema = z.object({
  entryId: z.string().uuid(),
})

export async function autoFillDayGaps(req: Request, res: Response) {
  const params = autoFillDayGapsParamsSchema.parse(req.params)

  const scheduleEntryRepository = new PrismaScheduleEntryRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const useCase = new AutoFillDayGapsUseCase(
    scheduleEntryRepository,
    teamMemberRepository,
  )

  const { item, gapReport } = await useCase.execute({
    entryId: params.entryId,
  })

  return res.status(200).json({
    entry: presentScheduleEntry(item),
    gapReport,
  })
}
