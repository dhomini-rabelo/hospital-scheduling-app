import { ScheduleEntryScheduleRequirementMap } from '../schedule-entry-schedule-requirement-map'

import { WatchedList } from '@/modules/domain/watched-list'

export class ScheduleEntryScheduleRequirementMapWatchedList extends WatchedList<ScheduleEntryScheduleRequirementMap> {
  compareItems(
    itemA: ScheduleEntryScheduleRequirementMap,
    itemB: ScheduleEntryScheduleRequirementMap,
  ): boolean {
    return (
      itemA.props.scheduleRequirementId === itemB.props.scheduleRequirementId
    )
  }
}
