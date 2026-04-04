import { EnableScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/enable-schedule-requirement'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleRequirement } from '@/infra/http/presenters/schedule-requirement-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const enableScheduleRequirementParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function enableScheduleRequirement(req: Request, res: Response) {
  const { id } = enableScheduleRequirementParamsSchema.parse(req.params)

  const repository = new PrismaScheduleRequirementRepository()
  const useCase = new EnableScheduleRequirementUseCase(repository)
  const { item } = await useCase.execute({ id })

  return res.status(200).json(presentScheduleRequirement(item))
}
