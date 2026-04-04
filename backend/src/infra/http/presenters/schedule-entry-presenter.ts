import { ScheduleEntryWithAggregateData } from '@/adapters/repositories/schedule-entry-repository'
import { ScheduleEntry } from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleOverviewResult } from '@/domain/use-cases/schedule-entry/get-schedule-overview'
import { presentTeamMember } from '@/infra/http/presenters/team-member-presenter'

export function presentScheduleEntry(scheduleEntry: ScheduleEntry) {
  return {
    id: scheduleEntry.id,
    date: scheduleEntry.props.date,
    structure: scheduleEntry.props.structure.value,
    createdAt: scheduleEntry.props.createdAt.toISOString(),
    updatedAt: scheduleEntry.props.updatedAt.toISOString(),
  }
}

export function presentScheduleEntryWithAggregateData(
  data: ScheduleEntryWithAggregateData,
) {
  return {
    ...presentScheduleEntry(data.scheduleEntry),
    teamMembers: data.teamMembers.map(presentTeamMember),
  }
}

export function presentScheduleOverview(overview: ScheduleOverviewResult) {
  return {
    date: overview.date,
    totalAssigned: overview.totalAssigned,
    entries: overview.entries.map((entry) => ({
      id: entry.id,
      teamMember: presentTeamMember(entry.teamMember),
    })),
    structureFulfillment: overview.structureFulfillment,
    requirementsFulfillment: overview.requirementsFulfillment,
  }
}
