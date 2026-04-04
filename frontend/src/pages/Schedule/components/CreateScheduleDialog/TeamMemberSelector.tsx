import { Badge } from '@/layout/components/ui/Badge'
import { useAPIRequest } from '@/layout/hooks/useAPIRequest'
import { API_ROUTES } from '@/server/routes'
import {
  PROFESSION_LABELS,
  Profession,
  type TeamMember,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { Loader2, Users } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { SetScheduleSchema } from './SetScheduleDialog'

function groupByProfession(
  teamMembers: TeamMember[],
): Record<string, TeamMember[]> {
  const groups: Record<string, TeamMember[]> = {}
  for (const member of teamMembers) {
    if (!groups[member.profession]) {
      groups[member.profession] = []
    }
    groups[member.profession].push(member)
  }
  return groups
}

export function TeamMemberSelector() {
  const { setValue, control } = useFormContext<SetScheduleSchema>()

  const selectedIds = useWatch({
    control,
    name: 'teamMemberIds',
  }) as string[]

  const apiRequest = useAPIRequest<TeamMember[]>({
    url: API_ROUTES.teamMembers.list,
  })

  function handleToggle(memberId: string) {
    const currentIds = selectedIds ?? []
    const isSelected = currentIds.includes(memberId)
    const updatedIds = isSelected
      ? currentIds.filter((id) => id !== memberId)
      : [...currentIds, memberId]
    setValue('teamMemberIds', updatedIds)
  }

  function handleSelectAllInProfession(members: TeamMember[]) {
    const currentIds = selectedIds ?? []
    const memberIds = members.map((m) => m.id)
    const allSelected = memberIds.every((id) => currentIds.includes(id))

    if (allSelected) {
      setValue(
        'teamMemberIds',
        currentIds.filter((id) => !memberIds.includes(id)),
      )
    } else {
      const newIds = new Set([...currentIds, ...memberIds])
      setValue('teamMemberIds', Array.from(newIds))
    }
  }

  if (apiRequest.state.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!apiRequest.state.data || apiRequest.state.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <Users size={18} className="text-text-tertiary" />
        </div>
        <p className="text-sm text-text-tertiary">
          No team members available.
        </p>
      </div>
    )
  }

  const grouped = groupByProfession(apiRequest.state.data)
  const professionOrder = Object.values(Profession)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-tertiary">
          {(selectedIds ?? []).length} member{(selectedIds ?? []).length !== 1 ? 's' : ''} selected
        </span>
      </div>

      {professionOrder.map((profession) => {
        const members = grouped[profession]
        if (!members || members.length === 0) return null

        const memberIds = members.map((m) => m.id)
        const allSelected = memberIds.every((id) =>
          (selectedIds ?? []).includes(id),
        )

        return (
          <div key={profession} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {PROFESSION_LABELS[profession]} ({members.length})
              </span>
              <button
                type="button"
                onClick={() => handleSelectAllInProfession(members)}
                className="text-xs font-medium text-primary-500 hover:text-primary-600"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {members.map((member) => {
                const isSelected = (selectedIds ?? []).includes(member.id)
                return (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/40 bg-surface px-3 py-2 transition-all duration-(--transition-base) hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(member.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-500 accent-primary-500"
                    />
                    <span className="flex-1 text-sm font-medium text-text-primary">
                      {member.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="primary">
                        {PROFESSION_LABELS[member.profession]}
                      </Badge>
                      <Badge variant="secondary">
                        {formatSpecialtyLabel(member.specialty)}
                      </Badge>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
