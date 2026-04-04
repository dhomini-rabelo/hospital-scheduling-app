import {
  ScheduleEntry,
  StructureDataJsonField,
} from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryScheduleRequirementMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-schedule-requirement-map'
import { ScheduleEntryTeamMemberMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-team-member-map'
import { ScheduleRequirement } from '@/domain/entities/schedule-requirement'
import { TeamMember } from '@/domain/entities/team-member'

export type ScheduleEntryWithAggregateData = {
  scheduleEntry: ScheduleEntry
  teamMembers: TeamMember[]
  scheduleRequirements: ScheduleRequirement[]
}

export type CreateScheduleEntryInput = {
  date: string
  structure: StructureDataJsonField
  teamMembers: ScheduleEntryTeamMemberMapWatchedList
  scheduleRequirements: ScheduleEntryScheduleRequirementMapWatchedList
}

export type UpdateScheduleEntryInput = {
  structure: StructureDataJsonField
  teamMembers: ScheduleEntryTeamMemberMapWatchedList
  scheduleRequirements: ScheduleEntryScheduleRequirementMapWatchedList
}

export abstract class ScheduleEntryRepository {
  abstract create(input: CreateScheduleEntryInput): Promise<ScheduleEntry>

  abstract findById(id: string): Promise<ScheduleEntry | null>

  abstract findByDate(date: string): Promise<ScheduleEntry | null>

  abstract findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ScheduleEntry[]>

  abstract update(
    id: string,
    input: UpdateScheduleEntryInput,
  ): Promise<ScheduleEntry>

  abstract delete(id: string): Promise<void>

  abstract getWithAggregateData(
    date: string,
  ): Promise<ScheduleEntryWithAggregateData | null>

  abstract listWithAggregateData(
    startDate: string,
    endDate: string,
  ): Promise<ScheduleEntryWithAggregateData[]>
}
