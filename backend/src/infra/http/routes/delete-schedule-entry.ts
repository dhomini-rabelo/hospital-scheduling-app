import { DeleteScheduleEntryUseCase } from '@/domain/use-cases/schedule-entry/delete-schedule-entry'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { Request, Response } from 'express'
import { z } from 'zod'

const deleteScheduleEntryParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteScheduleEntry(req: Request, res: Response) {
  const { id } = deleteScheduleEntryParamsSchema.parse(req.params)

  const repository = new PrismaScheduleEntryRepository()
  const useCase = new DeleteScheduleEntryUseCase(repository)
  await useCase.execute({ id })

  return res.status(204).send()
}
