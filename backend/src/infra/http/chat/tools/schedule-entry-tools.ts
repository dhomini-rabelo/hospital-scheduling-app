import type { StructureData } from '@/domain/entities/schedule-entry/schedule-entry'
import { Profession } from '@/domain/entities/team-member'
import { AutoFillDayGapsUseCase } from '@/domain/use-cases/schedule-entry/auto-fill-day-gaps'
import { AutoFillScheduleUseCase } from '@/domain/use-cases/schedule-entry/auto-fill-schedule'
import { DeleteScheduleEntryUseCase } from '@/domain/use-cases/schedule-entry/delete-schedule-entry'
import { GetScheduleOverviewUseCase } from '@/domain/use-cases/schedule-entry/get-schedule-overview'
import { ListScheduleEntriesUseCase } from '@/domain/use-cases/schedule-entry/list-schedule-entries'
import { ListSwapCandidatesUseCase } from '@/domain/use-cases/schedule-entry/list-swap-candidates'
import { SetScheduleEntriesUseCase } from '@/domain/use-cases/schedule-entry/set-schedule-entries'
import { SwapTeamMemberUseCase } from '@/domain/use-cases/schedule-entry/swap-team-member'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import {
  presentScheduleEntry,
  presentScheduleEntryWithAggregateData,
  presentScheduleOverview,
} from '@/infra/http/presenters/schedule-entry-presenter'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { DomainError, ValidationError } from '@/modules/domain/errors'
import { tool } from 'ai'
import { z } from 'zod'

const structureSchema = z
  .array(
    z.object({
      profession: z.nativeEnum(Profession),
      requiredCount: z.number().int().positive(),
      specialtyRequirements: z
        .array(
          z.object({
            specialty: z.string(),
            requiredCount: z.number().int().positive(),
          }),
        )
        .default([]),
    }),
  )
  .min(1)

export const scheduleEntryTools = {
  setScheduleEntries: tool({
    description:
      'Create or update schedule entries for specific dates. Defines the staffing structure (how many of each profession/specialty are needed) and optionally links schedule requirements. Does NOT assign team members — use autoFillSchedule for that.',
    inputSchema: z.object({
      dates: z
        .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
        .min(1)
        .describe('Array of dates in YYYY-MM-DD format'),
      structure: structureSchema.describe(
        'Staffing structure defining required counts per profession and specialty',
      ),
      scheduleRequirementIds: z
        .array(z.string().uuid())
        .default([])
        .describe('Optional schedule requirement IDs to link'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const scheduleEntryRepository = new PrismaScheduleEntryRepository()
        const scheduleRequirementRepository =
          new PrismaScheduleRequirementRepository()
        const useCase = new SetScheduleEntriesUseCase(
          scheduleEntryRepository,
          scheduleRequirementRepository,
        )
        const { items } = await useCase.execute({
          dates: input.dates,
          structure: input.structure as unknown as StructureData,
          scheduleRequirementIds: input.scheduleRequirementIds,
        })
        return { success: true as const, data: items.map(presentScheduleEntry) }
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

  autoFillSchedule: tool({
    description:
      'Automatically assign team members to all schedule entries for a full week (Monday to Sunday). The weekStartDate must be a Monday. Schedule entries must exist first (use setScheduleEntries to create them).',
    inputSchema: z.object({
      weekStartDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('Monday date of the week to auto-fill in YYYY-MM-DD format'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const scheduleEntryRepository = new PrismaScheduleEntryRepository()
        const teamMemberRepository = new PrismaTeamMemberRepository()
        const useCase = new AutoFillScheduleUseCase(
          scheduleEntryRepository,
          teamMemberRepository,
        )
        const { items, gapReport } = await useCase.execute({
          weekStartDate: input.weekStartDate,
        })
        return {
          success: true as const,
          data: {
            entries: items.map(presentScheduleEntry),
            gapReport,
          },
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

  listScheduleEntries: tool({
    description:
      'List schedule entries for a date range, including assigned team members and linked schedule requirements.',
    inputSchema: z.object({
      startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('Start date in YYYY-MM-DD format'),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('End date in YYYY-MM-DD format'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleEntryRepository()
        const useCase = new ListScheduleEntriesUseCase(repository)
        const { items } = await useCase.execute({
          startDate: input.startDate,
          endDate: input.endDate,
        })
        return {
          success: true as const,
          data: items.map(presentScheduleEntryWithAggregateData),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  deleteScheduleEntry: tool({
    description: 'Delete a schedule entry by its ID.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Schedule entry ID to delete'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaScheduleEntryRepository()
        const useCase = new DeleteScheduleEntryUseCase(repository)
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

  getScheduleOverview: tool({
    description:
      'Get a detailed overview of the schedule for a specific date, including which requirements are fulfilled, staffing gaps, and assigned team members.',
    inputSchema: z.object({
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('Date in YYYY-MM-DD format'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const scheduleEntryRepository = new PrismaScheduleEntryRepository()
        const scheduleRequirementRepository =
          new PrismaScheduleRequirementRepository()
        const useCase = new GetScheduleOverviewUseCase(
          scheduleEntryRepository,
          scheduleRequirementRepository,
        )
        const { overview } = await useCase.execute({ date: input.date })
        return {
          success: true as const,
          data: presentScheduleOverview(overview),
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  listSwapCandidates: tool({
    description:
      'List eligible team members who can replace a specific team member on a specific schedule entry. Returns candidates sorted by fewest weekly assignments.',
    inputSchema: z.object({
      entryId: z.string().uuid().describe('Schedule entry ID'),
      teamMemberId: z
        .string()
        .uuid()
        .describe('ID of the team member to be replaced'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const scheduleEntryRepository = new PrismaScheduleEntryRepository()
        const teamMemberRepository = new PrismaTeamMemberRepository()
        const useCase = new ListSwapCandidatesUseCase(
          scheduleEntryRepository,
          teamMemberRepository,
        )
        const { swapContext, candidates } = await useCase.execute({
          entryId: input.entryId,
          teamMemberId: input.teamMemberId,
        })
        return {
          success: true as const,
          data: {
            swapContext,
            candidates: candidates.map((candidate) => ({
              teamMember: presentTeamMember(candidate.teamMember),
              weekAssignmentCount: candidate.weekAssignmentCount,
            })),
          },
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

  swapTeamMember: tool({
    description:
      'Swap one team member for another on a specific schedule entry. The replacement must have the same profession (and same specialty if filling a specialty slot).',
    inputSchema: z.object({
      entryId: z.string().uuid().describe('Schedule entry ID'),
      removeTeamMemberId: z
        .string()
        .uuid()
        .describe('ID of the team member to remove'),
      addTeamMemberId: z
        .string()
        .uuid()
        .describe('ID of the replacement team member'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const scheduleEntryRepository = new PrismaScheduleEntryRepository()
        const teamMemberRepository = new PrismaTeamMemberRepository()
        const useCase = new SwapTeamMemberUseCase(
          scheduleEntryRepository,
          teamMemberRepository,
        )
        const { item } = await useCase.execute({
          entryId: input.entryId,
          removeTeamMemberId: input.removeTeamMemberId,
          addTeamMemberId: input.addTeamMemberId,
        })
        return {
          success: true as const,
          data: { entry: presentScheduleEntry(item) },
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

  autoFillDayGaps: tool({
    description:
      'Automatically fill unfilled slots for a specific schedule entry (single day). Preserves existing assignments and only fills gaps.',
    inputSchema: z.object({
      entryId: z.string().uuid().describe('Schedule entry ID'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const scheduleEntryRepository = new PrismaScheduleEntryRepository()
        const teamMemberRepository = new PrismaTeamMemberRepository()
        const useCase = new AutoFillDayGapsUseCase(
          scheduleEntryRepository,
          teamMemberRepository,
        )
        const { item, gapReport } = await useCase.execute({
          entryId: input.entryId,
        })
        return {
          success: true as const,
          data: {
            entry: presentScheduleEntry(item),
            gapReport,
          },
        }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),
}
