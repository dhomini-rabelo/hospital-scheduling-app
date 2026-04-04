import { Entity } from '@/modules/domain/entity'

export type ScheduleEntryScheduleRequirementMapProps = {
  scheduleEntryId: string
  scheduleRequirementId: string
  createdAt: Date
  updatedAt: Date
}

export class ScheduleEntryScheduleRequirementMap extends Entity<ScheduleEntryScheduleRequirementMapProps> {
  static create(
    props: Pick<
      ScheduleEntryScheduleRequirementMapProps,
      'scheduleEntryId' | 'scheduleRequirementId'
    >,
  ) {
    const now = new Date()
    return new ScheduleEntryScheduleRequirementMap({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reference(
    id: string,
    props: ScheduleEntryScheduleRequirementMapProps,
  ) {
    return new ScheduleEntryScheduleRequirementMap(props, id)
  }
}
