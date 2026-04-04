import { Entity } from '@/modules/domain/entity'

export type ScheduleEntryTeamMemberMapProps = {
  scheduleEntryId: string
  teamMemberId: string
  createdAt: Date
  updatedAt: Date
}

export class ScheduleEntryTeamMemberMap extends Entity<ScheduleEntryTeamMemberMapProps> {
  static create(
    props: Pick<
      ScheduleEntryTeamMemberMapProps,
      'scheduleEntryId' | 'teamMemberId'
    >,
  ) {
    const now = new Date()
    return new ScheduleEntryTeamMemberMap({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reference(id: string, props: ScheduleEntryTeamMemberMapProps) {
    return new ScheduleEntryTeamMemberMap(props, id)
  }
}
