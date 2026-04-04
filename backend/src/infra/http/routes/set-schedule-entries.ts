import type { StructureData } from '@/domain/entities/schedule-entry/schedule-entry'
import { Profession } from '@/domain/entities/team-member'
import { SetScheduleEntriesUseCase } from '@/domain/use-cases/schedule-entry/set-schedule-entries'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentScheduleEntry } from '@/infra/http/presenters/schedule-entry-presenter'
import { Request, Response } from 'express'
import { z } from 'zod'

const setScheduleEntriesSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  structure: z
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
  teamMemberIds: z.array(z.string().uuid()).default([]),
  scheduleRequirementIds: z.array(z.string().uuid()).default([]),
})

export async function setScheduleEntries(req: Request, res: Response) {
  const payload = setScheduleEntriesSchema.parse(req.body)

  const scheduleEntryRepository = new PrismaScheduleEntryRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const scheduleRequirementRepository =
    new PrismaScheduleRequirementRepository()
  const useCase = new SetScheduleEntriesUseCase(
    scheduleEntryRepository,
    teamMemberRepository,
    scheduleRequirementRepository,
  )

  const { items } = await useCase.execute({
    dates: payload.dates,
    structure: payload.structure as unknown as StructureData,
    teamMemberIds: payload.teamMemberIds,
    scheduleRequirementIds: payload.scheduleRequirementIds,
  })

  return res.status(200).json(items.map(presentScheduleEntry))
}
