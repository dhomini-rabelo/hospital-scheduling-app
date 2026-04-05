import type { RequirementsData } from '@/domain/entities/schedule-requirement'
import { Profession } from '@/domain/entities/team-member'
import { CreateScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/create-schedule-requirement'
import { DeleteScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/delete-schedule-requirement'
import { DisableScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/disable-schedule-requirement'
import { EnableScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/enable-schedule-requirement'
import { ListScheduleRequirementsUseCase } from '@/domain/use-cases/schedule-requirement/list-schedule-requirements'
import { UpdateScheduleRequirementUseCase } from '@/domain/use-cases/schedule-requirement/update-schedule-requirement'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { presentScheduleRequirement } from '@/infra/http/presenters/schedule-requirement-presenter'
import { DomainError, ValidationError } from '@/modules/domain/errors'
import { tool } from 'ai'
import { z } from 'zod'

const requirementsSchema = z
  .array(
    z.object({
      profession: z.nativeEnum(Profession),
      requiredCount: z
        .number()
        .int()
        .positive()
        .describe('Total staff of this profession needed'),
      specialtyRequirements: z
        .array(
          z.object({
            specialty: z.string().describe('Specialty enum value'),
            requiredCount: z
              .number()
              .int()
              .positive()
              .describe('How many of this specialty are needed'),
          }),
        )
        .default([]),
    }),
  )
  .min(1)

export const scheduleRequirementTools = {
  createScheduleRequirement: tool({
    description:
      'Create a schedule requirement for a date reference (e.g., "weekday", "weekend", "monday"). Defines how many staff of each profession are needed, with optional specialty breakdowns.',
    inputSchema: z.object({
      dateReference: z
        .string()
        .describe(
          'Date reference label like "weekday", "weekend", "monday", "1st of the month"',
        ),
      requirements: requirementsSchema,
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleRequirementRepository()
        const useCase = new CreateScheduleRequirementUseCase(repository)
        const { item } = await useCase.execute({
          dateReference: input.dateReference,
          requirements: input.requirements as unknown as RequirementsData,
        })
        return {
          success: true as const,
          data: presentScheduleRequirement(item),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        if (error instanceof ValidationError) {
          return {
            success: false as const,
            error: error.response.code,
            field: error.response.errorField,
          }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  listScheduleRequirements: tool({
    description:
      'List all schedule requirements. Use this to find requirement IDs before updating or deleting.',
    inputSchema: z.object({}),
    needsApproval: true,
    execute: async () => {
      try {
        const repository = new PrismaScheduleRequirementRepository()
        const useCase = new ListScheduleRequirementsUseCase(repository)
        const { items } = await useCase.execute()
        return {
          success: true as const,
          data: items.map(presentScheduleRequirement),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  updateScheduleRequirement: tool({
    description:
      'Update the requirements of a schedule requirement. Provide the requirement ID and the new requirements array.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Schedule requirement ID'),
      requirements: requirementsSchema,
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleRequirementRepository()
        const useCase = new UpdateScheduleRequirementUseCase(repository)
        const { item } = await useCase.execute({
          id: input.id,
          requirements: input.requirements as unknown as RequirementsData,
        })
        return {
          success: true as const,
          data: presentScheduleRequirement(item),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        if (error instanceof ValidationError) {
          return {
            success: false as const,
            error: error.response.code,
            field: error.response.errorField,
          }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  enableScheduleRequirement: tool({
    description:
      'Enable a schedule requirement so it is used by auto-fill and schedule validation.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Schedule requirement ID to enable'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleRequirementRepository()
        const useCase = new EnableScheduleRequirementUseCase(repository)
        const { item } = await useCase.execute({ id: input.id })
        return {
          success: true as const,
          data: presentScheduleRequirement(item),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  disableScheduleRequirement: tool({
    description:
      'Disable a schedule requirement so it is ignored by auto-fill and schedule validation.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Schedule requirement ID to disable'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleRequirementRepository()
        const useCase = new DisableScheduleRequirementUseCase(repository)
        const { item } = await useCase.execute({ id: input.id })
        return {
          success: true as const,
          data: presentScheduleRequirement(item),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  deleteScheduleRequirement: tool({
    description: 'Delete a schedule requirement by its ID.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Schedule requirement ID to delete'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleRequirementRepository()
        const useCase = new DeleteScheduleRequirementUseCase(repository)
        await useCase.execute({ id: input.id })
        return { success: true as const }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),
}
