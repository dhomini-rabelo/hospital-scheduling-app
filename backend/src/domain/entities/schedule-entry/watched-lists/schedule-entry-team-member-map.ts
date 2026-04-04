import { ScheduleEntryTeamMemberMap } from '../schedule-entry-team-member-map'

import { WatchedList } from '@/modules/domain/watched-list'

export class ScheduleEntryTeamMemberMapWatchedList extends WatchedList<ScheduleEntryTeamMemberMap> {
  compareItems(
    itemA: ScheduleEntryTeamMemberMap,
    itemB: ScheduleEntryTeamMemberMap,
  ): boolean {
    return itemA.props.teamMemberId === itemB.props.teamMemberId
  }
}
