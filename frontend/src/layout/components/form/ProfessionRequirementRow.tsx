import { Button } from '@/layout/components/ui/Button'
import { Input } from '@/layout/components/ui/Input'
import { Select } from '@/layout/components/ui/Select'
import {
  PROFESSION_LABELS,
  PROFESSION_SPECIALTIES,
  Profession,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { Plus, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { SpecialtyRequirementRow } from './SpecialtyRequirementRow'

const ALL_PROFESSION_OPTIONS = Object.values(Profession).map((value) => ({
  value,
  label: PROFESSION_LABELS[value],
}))

const EMPTY_SPECIALTY_ROW = {
  specialty: '',
  requiredCount: '' as unknown as number,
}

interface ProfessionRequirementRowProps {
  fieldPrefix: string
  index: number
  onRemove: () => void
  isRemoveDisabled: boolean
  usedProfessions: string[]
}

export function ProfessionRequirementRow({
  fieldPrefix,
  index,
  onRemove,
  isRemoveDisabled,
  usedProfessions,
}: ProfessionRequirementRowProps) {
  const { register, formState, control, setValue } =
    useFormContext<FieldValues>()

  const profession = useWatch({
    name: `${fieldPrefix}.${index}.profession`,
  })

  const {
    fields: specialtyFields,
    append: appendSpecialty,
    remove: removeSpecialty,
  } = useFieldArray({
    control,
    name: `${fieldPrefix}.${index}.specialtyRequirements`,
  })

  const specialtyValues = useWatch({
    control,
    name: `${fieldPrefix}.${index}.specialtyRequirements`,
  }) as { specialty: string; requiredCount: number }[] | undefined

  const professionOptions = ALL_PROFESSION_OPTIONS.filter(
    (option) =>
      option.value === profession ||
      !usedProfessions.includes(option.value),
  )

  const allSpecialtiesForProfession = profession
    ? (PROFESSION_SPECIALTIES[profession as Profession] ?? [])
    : []

  const selectedSpecialties = Array.isArray(specialtyValues)
    ? specialtyValues.map((s) => s.specialty)
    : []

  function getAvailableSpecialties(currentSpecialtyIndex: number) {
    const currentValue = selectedSpecialties[currentSpecialtyIndex]
    return allSpecialtiesForProfession
      .filter(
        (s) =>
          String(s) === currentValue ||
          !selectedSpecialties.includes(String(s)),
      )
      .map((value) => ({
        value: String(value),
        label: formatSpecialtyLabel(value),
      }))
  }

  const previousProfessionRef = useRef(profession)

  useEffect(() => {
    if (profession && profession !== previousProfessionRef.current) {
      setValue(`${fieldPrefix}.${index}.specialtyRequirements`, [])
    }
    previousProfessionRef.current = profession
  }, [profession, index, setValue, fieldPrefix])

  const fieldErrors = (
    formState.errors[fieldPrefix] as Record<string, unknown>[] | undefined
  )?.[index] as
    | {
        profession?: { message?: string }
        requiredCount?: { message?: string }
        specialtyRequirements?: { root?: { message?: string } }
      }
    | undefined

  return (
    <div className="rounded-xl border border-border/60 bg-surface-sunken/30 p-4">
      <div className="flex items-start gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Select
            label="Profession"
            options={professionOptions}
            placeholder="Select profession"
            registration={register(`${fieldPrefix}.${index}.profession`)}
            error={fieldErrors?.profession?.message}
          />
          <Input
            label="Required Count"
            type="number"
            placeholder="e.g. 5"
            min={1}
            registration={register(
              `${fieldPrefix}.${index}.requiredCount`,
              { valueAsNumber: true },
            )}
            error={fieldErrors?.requiredCount?.message}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={isRemoveDisabled}
          className="mt-7 rounded-lg p-1.5 text-text-tertiary transition-all duration-(--transition-base) hover:bg-error-50 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-tertiary"
        >
          <X size={16} />
        </button>
      </div>

      {profession && (
        <div className="mt-3 border-t border-border/40 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Specialty Requirements
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => appendSpecialty(EMPTY_SPECIALTY_ROW)}
              disabled={
                specialtyFields.length >= allSpecialtiesForProfession.length
              }
            >
              <Plus size={14} />
              Add Specialty
            </Button>
          </div>

          {specialtyFields.length > 0 && (
            <div className="flex flex-col gap-2">
              {specialtyFields.map((field, specialtyIndex) => (
                <SpecialtyRequirementRow
                  key={field.id}
                  fieldPrefix={fieldPrefix}
                  professionIndex={index}
                  specialtyIndex={specialtyIndex}
                  onRemove={() => removeSpecialty(specialtyIndex)}
                  availableSpecialties={getAvailableSpecialties(
                    specialtyIndex,
                  )}
                />
              ))}
            </div>
          )}

          {fieldErrors?.specialtyRequirements?.root?.message && (
            <p className="mt-2 text-xs font-medium text-error-600">
              {fieldErrors.specialtyRequirements.root.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
