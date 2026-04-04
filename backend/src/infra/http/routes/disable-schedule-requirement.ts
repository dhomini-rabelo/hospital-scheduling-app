import { DisableScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/disable-schedule-requirement'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleRequirement } from '@/infra/http/presenters/schedule-requirement-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const disableScheduleRequirementParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function disableScheduleRequirement(req: Request, res: Response) {
  const { id } = disableScheduleRequirementParamsSchema.parse(req.params)

  const repository = new PrismaScheduleRequirementRepository()
  const useCase = new DisableScheduleRequirementUseCase(repository)
  const { item } = await useCase.execute({ id })

  return res.status(200).json(presentScheduleRequirement(item))
}
