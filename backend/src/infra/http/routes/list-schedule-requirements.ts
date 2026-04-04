import { ListScheduleRequirementsUseCase } from '@/domain/use-cases/schedule-requirement/list-schedule-requirements'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleRequirement } from '@/infra/http/presenters/schedule-requirement-presenter'
import { Request, Response } from 'express'

export async function listScheduleRequirements(_req: Request, res: Response) {
  const repository = new PrismaScheduleRequirementRepository()
  const useCase = new ListScheduleRequirementsUseCase(repository)
  const { items } = await useCase.execute()

  return res.status(200).json(items.map(presentScheduleRequirement))
}
