import { useAPIRequest } from '@/layout/hooks/useAPIRequest'
import { API_ROUTES } from '@/server/routes'
import {
  PROFESSION_LABELS,
  type ProfessionRequirement,
  type ScheduleRequirement,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { Loader2 } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { SetScheduleSchema } from './SetScheduleDialog'

function formatProfessionSummary(requirement: ProfessionRequirement): string {
  const professionLabel = `${requirement.requiredCount} ${PROFESSION_LABELS[requirement.profession]}${requirement.requiredCount > 1 ? 's' : ''}`
  if (requirement.specialtyRequirements.length === 0) return professionLabel
  const specialtySummary = requirement.specialtyRequirements
    .map((s) => `${s.requiredCount} ${formatSpecialtyLabel(s.specialty)}`)
    .join(', ')
  return `${professionLabel} (${specialtySummary})`
}

function formatRequirementSummary(requirement: ScheduleRequirement): string {
  return requirement.requirements.map(formatProfessionSummary).join(', ')
}

export function RequirementSelector() {
  const { setValue, control } = useFormContext<SetScheduleSchema>()

  const selectedIds = useWatch({
    control,
    name: 'scheduleRequirementIds',
  }) as string[]

  const apiRequest = useAPIRequest<ScheduleRequirement[]>({
    url: API_ROUTES.scheduleRequirements.list,
  })

  function handleToggle(requirementId: string) {
    const currentIds = selectedIds ?? []
    const isSelected = currentIds.includes(requirementId)
    const updatedIds = isSelected
      ? currentIds.filter((id) => id !== requirementId)
      : [...currentIds, requirementId]
    setValue('scheduleRequirementIds', updatedIds)
  }

  if (apiRequest.state.isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={18} className="animate-spin text-primary-500" />
      </div>
    )
  }

  const enabledRequirements =
    apiRequest.state.data?.filter((r) => r.isEnabled) ?? []

  if (enabledRequirements.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">
        No enabled schedule requirements available.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {enabledRequirements.map((requirement) => {
        const isSelected = (selectedIds ?? []).includes(requirement.id)
        return (
          <label
            key={requirement.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/40 bg-surface px-3 py-2.5 transition-all duration-(--transition-base) hover:bg-neutral-50"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(requirement.id)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-500 accent-primary-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-text-primary">
                {requirement.dateReference}
              </span>
              <span className="ml-2 text-xs text-text-tertiary">
                {formatRequirementSummary(requirement)}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
