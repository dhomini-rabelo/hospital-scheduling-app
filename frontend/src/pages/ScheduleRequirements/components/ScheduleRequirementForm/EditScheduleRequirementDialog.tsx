import { Button } from '@/components/ui/Button'
import {
  updateScheduleRequirement,
  type UpdateScheduleRequirementInput,
} from '@/server/api/schedule-requirements'
import type { ScheduleRequirement } from '@/server/types/entities'
import { Profession } from '@/server/types/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ProfessionRequirementRow } from './ProfessionRequirementRow'

const specialtyRequirementSchema = z.object({
  specialty: z.string().min(1, 'Select a specialty'),
  requiredCount: z
    .number({ message: 'Must be at least 1' })
    .int()
    .positive('Must be at least 1'),
})

const professionRequirementSchema = z.object({
  profession: z.nativeEnum(Profession, { message: 'Select a profession' }),
  requiredCount: z
    .number({ message: 'Must be at least 1' })
    .int()
    .positive('Must be at least 1'),
  specialtyRequirements: z.array(specialtyRequirementSchema),
})

const editScheduleRequirementSchema = z.object({
  requirements: z
    .array(professionRequirementSchema)
    .min(1)
    .superRefine((requirements, ctx) => {
      requirements.forEach((req, index) => {
        const specialtySum = req.specialtyRequirements.reduce(
          (acc, s) => acc + s.requiredCount,
          0,
        )
        if (specialtySum > req.requiredCount) {
          ctx.addIssue({
            code: 'custom',
            message: 'Specialty counts cannot exceed total required',
            path: [index, 'specialtyRequirements'],
          })
        }
      })
    }),
})

type EditScheduleRequirementSchema = z.infer<
  typeof editScheduleRequirementSchema
>

interface EditScheduleRequirementDialogProps {
  requirement: ScheduleRequirement
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_PROFESSION_ROW = {
  profession: '' as Profession,
  requiredCount: '' as unknown as number,
  specialtyRequirements: [],
}

interface EditScheduleRequirementDialogState {
  formError: string | null
}

export function EditScheduleRequirementDialog({
  requirement,
  onClose,
  onSuccess,
}: EditScheduleRequirementDialogProps) {
  const [state, setState] =
    useState<EditScheduleRequirementDialogState>({
      formError: null,
    })

  const form = useForm<EditScheduleRequirementSchema>({
    resolver: zodResolver(editScheduleRequirementSchema),
    defaultValues: {
      requirements: requirement.requirements.map((r) => ({
        profession: r.profession,
        requiredCount: r.requiredCount,
        specialtyRequirements: r.specialtyRequirements.map((s) => ({
          specialty: s.specialty,
          requiredCount: s.requiredCount,
        })),
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'requirements',
  })

  const requirementsWatch = useWatch({
    control: form.control,
    name: 'requirements',
  })

  const usedProfessions = Array.isArray(requirementsWatch)
    ? requirementsWatch.map((r) => r.profession).filter(Boolean)
    : []

  async function handleFormSubmit(data: EditScheduleRequirementSchema) {
    try {
      setState({ formError: null })
      await updateScheduleRequirement(requirement.id, {
        requirements:
          data.requirements as unknown as UpdateScheduleRequirementInput['requirements'],
      })
      onSuccess()
      onClose()
    } catch {
      setState({
        formError:
          'Failed to update schedule requirement. Please try again.',
      })
    }
  }

  function handleAddProfession() {
    append(EMPTY_PROFESSION_ROW)
  }

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="modal-content card-raised relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
            <Pencil size={16} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-heading-4">Edit Schedule Requirement</h2>
            <p className="text-sm text-text-tertiary">
              {requirement.dateReference}
            </p>
          </div>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <span className="font-heading text-sm font-semibold text-text-secondary">
                Profession Requirements
              </span>
              {fields.map((field, index) => (
                <ProfessionRequirementRow
                  key={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                  isRemoveDisabled={fields.length === 1}
                  usedProfessions={usedProfessions.map(String)}
                />
              ))}
            </div>

            {state.formError && (
              <div className="rounded-xl border border-error-100 bg-error-50 px-4 py-2.5">
                <p className="text-sm font-medium text-error-700">
                  {state.formError}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddProfession}
                disabled={
                  fields.length >= Object.values(Profession).length
                }
              >
                <Plus size={16} />
                Add Profession
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={form.formState.isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
