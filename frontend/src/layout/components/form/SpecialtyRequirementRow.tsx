import { Input } from '@/layout/components/ui/Input'
import { Select } from '@/layout/components/ui/Select'
import { X } from 'lucide-react'
import type { FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

interface SpecialtyRequirementRowProps {
  fieldPrefix: string
  professionIndex: number
  specialtyIndex: number
  onRemove: () => void
  availableSpecialties: { value: string; label: string }[]
}

export function SpecialtyRequirementRow({
  fieldPrefix,
  professionIndex,
  specialtyIndex,
  onRemove,
  availableSpecialties,
}: SpecialtyRequirementRowProps) {
  const { register, formState } = useFormContext<FieldValues>()

  const fieldErrors =
    (formState.errors[fieldPrefix] as Record<string, unknown>[] | undefined)?.[
      professionIndex
    ] as { specialtyRequirements?: Record<string, unknown>[] } | undefined

  const specialtyErrors =
    fieldErrors?.specialtyRequirements?.[specialtyIndex] as
      | { specialty?: { message?: string }; requiredCount?: { message?: string } }
      | undefined

  return (
    <div className="flex items-start gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2">
        <Select
          options={availableSpecialties}
          placeholder="Select specialty"
          registration={register(
            `${fieldPrefix}.${professionIndex}.specialtyRequirements.${specialtyIndex}.specialty`,
          )}
          error={specialtyErrors?.specialty?.message}
        />
        <Input
          type="number"
          placeholder="Count"
          min={1}
          registration={register(
            `${fieldPrefix}.${professionIndex}.specialtyRequirements.${specialtyIndex}.requiredCount`,
            { valueAsNumber: true },
          )}
          error={specialtyErrors?.requiredCount?.message}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-2.5 rounded-lg p-1 text-text-tertiary transition-all duration-(--transition-base) hover:bg-error-50 hover:text-error-600"
      >
        <X size={14} />
      </button>
    </div>
  )
}
