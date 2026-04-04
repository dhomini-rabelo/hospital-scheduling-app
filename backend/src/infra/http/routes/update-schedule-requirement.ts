import { Profession } from '@/domain/entities/team-member'
import { UpdateScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/update-schedule-requirement'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleRequirement } from '@/infra/http/presenters/schedule-requirement-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const updateScheduleRequirementParamsSchema = z.object({
  id: z.string().uuid(),
})

const updateScheduleRequirementBodySchema = z.object({
  requirements: z
    .array(
      z.object({
        profession: z.nativeEnum(Profession),
        requiredCount: z.number().int().positive(),
        specialtyRequirements: z
          .array(
            z.object({
              specialty: z.string().min(1),
              requiredCount: z.number().int().positive(),
            }),
          )
          .default([]),
      }),
    )
    .min(1),
})

export async function updateScheduleRequirement(req: Request, res: Response) {
  const { id } = updateScheduleRequirementParamsSchema.parse(req.params)
  const body = updateScheduleRequirementBodySchema.parse(req.body)

  const repository = new PrismaScheduleRequirementRepository()
  const useCase = new UpdateScheduleRequirementUseCase(repository)
  const { item } = await useCase.execute({
    id,
    requirements: body.requirements,
  })

  return res.status(200).json(presentScheduleRequirement(item))
}
