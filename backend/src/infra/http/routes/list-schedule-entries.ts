import { ListScheduleEntriesUseCase } from '@/domain/use-cases/schedule-entry/list-schedule-entries'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { presentScheduleEntryWithAggregateData } from '@/infra/http/presenters/schedule-entry-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const listScheduleEntriesQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function listScheduleEntries(req: Request, res: Response) {
  const query = listScheduleEntriesQuerySchema.parse(req.query)

  const repository = new PrismaScheduleEntryRepository()
  const useCase = new ListScheduleEntriesUseCase(repository)
  const { items } = await useCase.execute({
    startDate: query.startDate,
    endDate: query.endDate,
  })

  return res.status(200).json(items.map(presentScheduleEntryWithAggregateData))
}
