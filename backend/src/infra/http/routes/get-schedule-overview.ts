import { GetScheduleOverviewUseCase } from '@/domain/use-cases/schedule-entry/get-schedule-overview'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleOverview } from '@/infra/http/presenters/schedule-entry-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const getScheduleOverviewQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function getScheduleOverview(req: Request, res: Response) {
  const query = getScheduleOverviewQuerySchema.parse(req.query)

  const scheduleEntryRepository = new PrismaScheduleEntryRepository()
  const scheduleRequirementRepository =
    new PrismaScheduleRequirementRepository()
  const useCase = new GetScheduleOverviewUseCase(
    scheduleEntryRepository,
    scheduleRequirementRepository,
  )

  const { overview } = await useCase.execute({ date: query.date })

  return res.status(200).json(presentScheduleOverview(overview))
}
