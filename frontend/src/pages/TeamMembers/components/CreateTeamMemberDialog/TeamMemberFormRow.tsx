import { Input } from '@/layout/components/ui/Input'
import { Select } from '@/layout/components/ui/Select'
import {
    PROFESSION_LABELS,
    PROFESSION_SPECIALTIES,
    Profession,
    formatSpecialtyLabel,
} from '@/server/types/entities'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { TeamMemberFormSchema } from './CreateTeamMemberDialog'

const PROFESSION_OPTIONS = Object.values(Profession).map((value) => ({
  value,
  label: PROFESSION_LABELS[value],
}))

interface TeamMemberFormRowProps {
  index: number
  onRemove: () => void
  isRemoveDisabled: boolean
}

export function TeamMemberFormRow({
  index,
  onRemove,
  isRemoveDisabled,
}: TeamMemberFormRowProps) {
  const { register, formState, setValue } =
    useFormContext<TeamMemberFormSchema>()

  const profession = useWatch<TeamMemberFormSchema>({
    name: `items.${index}.profession`,
  })

  const specialtyOptions = profession
    ? (PROFESSION_SPECIALTIES[profession as Profession] ?? []).map((value) => ({
        value,
        label: formatSpecialtyLabel(value),
      }))
    : []

  useEffect(() => {
    if (profession) {
      setValue(`items.${index}.specialty`, '')
    }
  }, [profession, index, setValue])

  const fieldErrors = formState.errors.items?.[index]

  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-sunken/50 p-3 transition-colors duration-(--transition-base)">
      <div className="grid flex-1 grid-cols-3 gap-3">
        <Input
          placeholder="Name"
          registration={register(`items.${index}.name`)}
          error={fieldErrors?.name?.message}
        />
        <Select
          options={PROFESSION_OPTIONS}
          placeholder="Select profession"
          registration={register(`items.${index}.profession`)}
          error={fieldErrors?.profession?.message}
        />
        <Select
          options={specialtyOptions}
          placeholder="Select specialty"
          registration={register(`items.${index}.specialty`)}
          error={fieldErrors?.specialty?.message}
          disabled={!profession}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoveDisabled}
        className="mt-2.5 rounded-lg p-1.5 text-text-tertiary transition-all duration-(--transition-base) hover:bg-error-50 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-tertiary"
      >
        <X size={16} />
      </button>
    </div>
  )
}
