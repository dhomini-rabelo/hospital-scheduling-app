import { Profession } from '@/domain/entities/team-member'
import { CreateScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/create-schedule-requirement'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleRequirement } from '@/infra/http/presenters/schedule-requirement-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const createScheduleRequirementSchema = z.object({
  dateReference: z.string().min(1),
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

export async function createScheduleRequirement(req: Request, res: Response) {
  const payload = createScheduleRequirementSchema.parse(req.body)

  const repository = new PrismaScheduleRequirementRepository()
  const useCase = new CreateScheduleRequirementUseCase(repository)
  const { item } = await useCase.execute({
    dateReference: payload.dateReference,
    requirements: payload.requirements,
  })

  return res.status(201).json(presentScheduleRequirement(item))
}
