import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { CreateScheduleRequirementSchema } from './CreateScheduleRequirementDialog'

interface SpecialtyRequirementRowProps {
  professionIndex: number
  specialtyIndex: number
  onRemove: () => void
  availableSpecialties: { value: string; label: string }[]
}

export function SpecialtyRequirementRow({
  professionIndex,
  specialtyIndex,
  onRemove,
  availableSpecialties,
}: SpecialtyRequirementRowProps) {
  const { register, formState } =
    useFormContext<CreateScheduleRequirementSchema>()

  const fieldErrors =
    formState.errors.requirements?.[professionIndex]?.specialtyRequirements?.[
      specialtyIndex
    ]

  return (
    <div className="flex items-start gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2">
        <Select
          options={availableSpecialties}
          placeholder="Select specialty"
          registration={register(
            `requirements.${professionIndex}.specialtyRequirements.${specialtyIndex}.specialty`,
          )}
          error={fieldErrors?.specialty?.message}
        />
        <Input
          type="number"
          placeholder="Count"
          min={1}
          registration={register(
            `requirements.${professionIndex}.specialtyRequirements.${specialtyIndex}.requiredCount`,
            { valueAsNumber: true },
          )}
          error={fieldErrors?.requiredCount?.message}
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
