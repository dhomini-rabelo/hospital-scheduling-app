import { Input } from '@/layout/components/ui/Input'
import { Select } from '@/layout/components/ui/Select'
import { X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { SetScheduleSchema } from './SetScheduleDialog'

interface StructureSpecialtyRowProps {
  professionIndex: number
  specialtyIndex: number
  onRemove: () => void
  availableSpecialties: { value: string; label: string }[]
}

export function StructureSpecialtyRow({
  professionIndex,
  specialtyIndex,
  onRemove,
  availableSpecialties,
}: StructureSpecialtyRowProps) {
  const { register, formState } = useFormContext<SetScheduleSchema>()

  const fieldErrors =
    formState.errors.structure?.[professionIndex]?.specialtyRequirements?.[
      specialtyIndex
    ]

  return (
    <div className="flex items-start gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2">
        <Select
          options={availableSpecialties}
          placeholder="Select specialty"
          registration={register(
            `structure.${professionIndex}.specialtyRequirements.${specialtyIndex}.specialty`,
          )}
          error={fieldErrors?.specialty?.message}
        />
        <Input
          type="number"
          placeholder="Count"
          min={1}
          registration={register(
            `structure.${professionIndex}.specialtyRequirements.${specialtyIndex}.requiredCount`,
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
