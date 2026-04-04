import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  PROFESSION_LABELS,
  PROFESSION_SPECIALTIES,
  Profession,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import type { TeamMemberFormSchema } from './TeamMemberForm'

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
    <div className="flex items-start gap-3">
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
        className="mt-2 rounded-md p-1 text-text-tertiary transition-colors duration-[var(--transition-fast)] hover:bg-neutral-100 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <X size={18} />
      </button>
    </div>
  )
}
