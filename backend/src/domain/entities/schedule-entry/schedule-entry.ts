import { ScheduleEntryTeamMemberMapWatchedList } from './watched-lists/schedule-entry-team-member-map'

import { ProfessionRequirement } from '@/domain/entities/schedule-requirement'
import { Entity } from '@/modules/domain/entity'
import { JsonField } from '@/modules/domain/json-field'

export type StructureData = ProfessionRequirement[]

export class StructureDataJsonField extends JsonField<StructureData> {
  static create(value: StructureData) {
    return new StructureDataJsonField(value)
  }
}

export type ScheduleEntryProps = {
  date: string
  structure: StructureDataJsonField
  teamMembers: ScheduleEntryTeamMemberMapWatchedList
  createdAt: Date
  updatedAt: Date
}

export class ScheduleEntry extends Entity<ScheduleEntryProps> {
  static create(
    props: Pick<ScheduleEntryProps, 'date' | 'structure' | 'teamMembers'>,
  ) {
    const now = new Date()
    return new ScheduleEntry({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reference(id: string, props: ScheduleEntryProps) {
    return new ScheduleEntry(props, id)
  }
}
