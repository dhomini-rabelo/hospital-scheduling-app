import { AutoFillScheduleUseCase } from '@/domain/use-cases/schedule-entry/auto-fill-schedule'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentScheduleEntry } from '@/infra/http/presenters/schedule-entry-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const autoFillScheduleSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function autoFillSchedule(req: Request, res: Response) {
  const payload = autoFillScheduleSchema.parse(req.body)

  const scheduleEntryRepository = new PrismaScheduleEntryRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const useCase = new AutoFillScheduleUseCase(
    scheduleEntryRepository,
    teamMemberRepository,
  )

  const { items, gapReport } = await useCase.execute({
    weekStartDate: payload.weekStartDate,
  })

  return res.status(200).json({
    entries: items.map(presentScheduleEntry),
    gapReport,
  })
}
