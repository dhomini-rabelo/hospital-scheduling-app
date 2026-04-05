import { Profession, Specialty } from '@/domain/entities/team-member'
import { CreateTeamMembersUseCase } from '@/domain/use-cases/team-member/create-team-members'
import { DeleteTeamMemberUseCase } from '@/domain/use-cases/team-member/delete-team-member'
import { ListTeamMembersUseCase } from '@/domain/use-cases/team-member/list-team-members'
import { UpdateTeamMemberUseCase } from '@/domain/use-cases/team-member/update-team-member'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'
import { DomainError, ValidationError } from '@/modules/domain/errors'
import { tool } from 'ai'
import { z } from 'zod'

export const teamMemberTools = {
  createTeamMembers: tool({
    description:
      'Create one or more team members. Each needs a name, profession, and specialty. Use the exact enum values for profession and specialty.',
    inputSchema: z.object({
      items: z
        .array(
          z.object({
            name: z.string().describe('Full name of the team member'),
            profession: z
              .nativeEnum(Profession)
              .describe('Profession enum value'),
            specialty: z
              .string()
              .describe('Specialty enum value matching the profession'),
          }),
        )
        .min(1),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaTeamMemberRepository()
        const useCase = new CreateTeamMembersUseCase(repository)
        const { items } = await useCase.execute({
          items: input.items.map((item) => ({
            name: item.name,
            profession: item.profession,
            specialty: item.specialty as Specialty,
          })),
        })
        return { success: true as const, data: items.map(presentTeamMember) }
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

  listTeamMembers: tool({
    description:
      'List all team members, optionally filtered by profession. Use this to find team member IDs before updating or deleting.',
    inputSchema: z.object({
      profession: z
        .nativeEnum(Profession)
        .optional()
        .describe('Optional profession filter'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaTeamMemberRepository()
        const useCase = new ListTeamMembersUseCase(repository)
        const { items } = await useCase.execute({
          profession: input.profession,
        })
        return { success: true as const, data: items.map(presentTeamMember) }
      } catch (error) {
        if (error instanceof DomainError) {
          return { success: false as const, error: error.response.code }
        }
        return { success: false as const, error: 'UNEXPECTED_ERROR' }
      }
    },
  }),

  updateTeamMember: tool({
    description:
      'Update a team member name, profession, or specialty. You must provide the team member ID.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Team member ID'),
      name: z.string().optional().describe('New name'),
      profession: z
        .nativeEnum(Profession)
        .optional()
        .describe('New profession'),
      specialty: z.string().optional().describe('New specialty'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaTeamMemberRepository()
        const useCase = new UpdateTeamMemberUseCase(repository)
        const { item } = await useCase.execute({
          id: input.id,
          name: input.name,
          profession: input.profession,
          specialty: input.specialty as Specialty | undefined,
        })
        return { success: true as const, data: presentTeamMember(item) }
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

  deleteTeamMember: tool({
    description:
      'Delete a team member by their ID. Use listTeamMembers first to find the correct ID.',
    inputSchema: z.object({
      id: z.string().uuid().describe('Team member ID to delete'),
    }),
    needsApproval: true,
    execute: async (input) => {
      try {
        const repository = new PrismaTeamMemberRepository()
        const useCase = new DeleteTeamMemberUseCase(repository)
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
