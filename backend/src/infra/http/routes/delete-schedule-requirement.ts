import { DeleteScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/delete-schedule-requirement'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { Request, Response } from 'express'
import { z } from 'zod'

const deleteScheduleRequirementParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteScheduleRequirement(req: Request, res: Response) {
  const { id } = deleteScheduleRequirementParamsSchema.parse(req.params)

  const repository = new PrismaScheduleRequirementRepository()
  const useCase = new DeleteScheduleRequirementUseCase(repository)
  await useCase.execute({ id })

  return res.status(204).send()
}
