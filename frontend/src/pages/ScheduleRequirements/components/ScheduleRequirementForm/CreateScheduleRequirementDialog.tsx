import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  createScheduleRequirement,
  type CreateScheduleRequirementInput,
} from '@/server/api/schedule-requirements'
import { Profession } from '@/server/types/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Plus, Send } from 'lucide-react'
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

const requirementsArraySchema = z
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
  })

const createScheduleRequirementSchema = z.object({
  dateReference: z.string().min(1, 'Date reference is required'),
  requirements: requirementsArraySchema,
})

export type CreateScheduleRequirementSchema = z.infer<
  typeof createScheduleRequirementSchema
>

interface CreateScheduleRequirementDialogProps {
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_PROFESSION_ROW = {
  profession: '' as Profession,
  requiredCount: '' as unknown as number,
  specialtyRequirements: [],
}

interface CreateScheduleRequirementDialogState {
  formError: string | null
}

export function CreateScheduleRequirementDialog({
  onClose,
  onSuccess,
}: CreateScheduleRequirementDialogProps) {
  const [state, setState] =
    useState<CreateScheduleRequirementDialogState>({
      formError: null,
    })

  const form = useForm<CreateScheduleRequirementSchema>({
    resolver: zodResolver(createScheduleRequirementSchema),
    defaultValues: {
      dateReference: '',
      requirements: [EMPTY_PROFESSION_ROW],
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

  async function handleSubmit(data: CreateScheduleRequirementSchema) {
    try {
      setState({ formError: null })
      await createScheduleRequirement({
        dateReference: data.dateReference,
        requirements:
          data.requirements as unknown as CreateScheduleRequirementInput['requirements'],
      })
      onSuccess()
      onClose()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setState({
          formError:
            'A requirement for this date reference already exists.',
        })
      } else {
        setState({
          formError:
            'Failed to create schedule requirement. Please try again.',
        })
      }
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
            <Plus size={16} className="text-primary-600" />
          </div>
          <h2 className="text-heading-4">New Schedule Requirement</h2>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Date Reference"
              placeholder="e.g. weekday, weekend, monday"
              registration={form.register('dateReference')}
              error={form.formState.errors.dateReference?.message}
            />

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
                  size="sm"
                  onClick={onClose}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={form.formState.isSubmitting}
                >
                  <Send size={14} />
                  Create
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
