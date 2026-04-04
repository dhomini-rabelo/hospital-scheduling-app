import { ScheduleRequirement } from '@/domain/entities/schedule-requirement'

export function presentScheduleRequirement(
  scheduleRequirement: ScheduleRequirement,
) {
  return {
    id: scheduleRequirement.id,
    dateReference: scheduleRequirement.props.dateReference,
    requirements: scheduleRequirement.props.requirements.value,
    isEnabled: scheduleRequirement.props.isEnabled,
    createdAt: scheduleRequirement.props.createdAt.toISOString(),
    updatedAt: scheduleRequirement.props.updatedAt.toISOString(),
  }
}
