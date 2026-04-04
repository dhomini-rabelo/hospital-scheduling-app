import { Button } from '@/layout/components/ui/Button'
import type { SetScheduleEntriesInput } from '@/server/api/schedule-entries'
import { setScheduleEntries } from '@/server/api/schedule-entries'
import { Profession } from '@/server/types/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { ArrowLeft, ArrowRight, CalendarCog, Plus, Send } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { DateSelector } from './DateSelector'
import { RequirementSelector } from './RequirementSelector'
import { StructureProfessionRow } from './StructureProfessionRow'
import { StructureSummary } from './StructureSummary'
import { TeamMemberSelector } from './TeamMemberSelector'

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

const structureArraySchema = z
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

const setScheduleSchema = z.object({
  dates: z.array(z.string()).min(1, 'Select at least one date'),
  structure: structureArraySchema,
  teamMemberIds: z.array(z.string()),
  scheduleRequirementIds: z.array(z.string()),
})

export type SetScheduleSchema = z.infer<typeof setScheduleSchema>

type DialogStage = 'structure' | 'team-members'

interface SetScheduleDialogProps {
  onClose: () => void
  onSuccess: () => void
}

const VALIDATION_ERROR_MESSAGES: Record<string, (...variables: string[]) => string> = {
  TEAM_MEMBER_NOT_FOUND: (id) =>
    `Team member not found (${id}).`,
  SCHEDULE_REQUIREMENT_NOT_FOUND: (id) =>
    `Schedule requirement not found (${id}).`,
  TEAM_MEMBER_PROFESSION_NOT_IN_STRUCTURE: (name, profession) =>
    `${name} is a ${profession} but the structure has no ${profession} requirement.`,
  PROFESSION_COUNT_EXCEEDS_STRUCTURE: (profession, assigned, required) =>
    `Too many ${profession}s selected: ${assigned} assigned but structure allows ${required}.`,
  SPECIALTY_COUNT_EXCEEDS_STRUCTURE: (specialty, assigned, required) =>
    `Too many ${specialty} specialists: ${assigned} assigned but structure allows ${required}.`,
  NO_AVAILABLE_SLOT_FOR_SPECIALTY: (name, profession, specialty) =>
    `${name} (${specialty} ${profession}) cannot be assigned — all ${profession} slots are reserved for other specialties.`,
  DATES_OUTSIDE_ALLOWED_RANGE: (...dates) =>
    `These dates are outside the allowed range: ${dates.join(', ')}.`,
  STRUCTURE_MUST_NOT_BE_EMPTY: () =>
    'The staffing structure must have at least one profession.',
  INVALID_PROFESSION: (profession) =>
    `Invalid profession: ${profession}.`,
  DUPLICATE_PROFESSION: (profession) =>
    `Duplicate profession in structure: ${profession}.`,
  INVALID_SPECIALTY_FOR_PROFESSION: (profession, specialty) =>
    `${specialty} is not a valid specialty for ${profession}.`,
  DUPLICATE_SPECIALTY: (specialty) =>
    `Duplicate specialty: ${specialty}.`,
  SPECIALTY_SUM_EXCEEDS_REQUIRED_COUNT: (profession, sum, required) =>
    `Specialty counts for ${profession} sum to ${sum} but only ${required} required.`,
}

function parseValidationError(responseData: Record<string, string[]>): string {
  for (const messages of Object.values(responseData)) {
    if (!Array.isArray(messages)) continue
    for (const raw of messages) {
      const [code, variablesStr] = raw.split('#')
      const variables = variablesStr ? variablesStr.split(',') : []
      const formatter = VALIDATION_ERROR_MESSAGES[code]
      if (formatter) {
        return formatter(...variables)
      }
      return raw
    }
  }
  return 'Failed to set schedule. Please try again.'
}

const EMPTY_PROFESSION_ROW = {
  profession: '' as Profession,
  requiredCount: '' as unknown as number,
  specialtyRequirements: [],
}

interface SetScheduleDialogState {
  stage: DialogStage
  formError: string | null
}

export function SetScheduleDialog({
  onClose,
  onSuccess,
}: SetScheduleDialogProps) {
  const [state, setState] = useState<SetScheduleDialogState>({
    stage: 'structure',
    formError: null,
  })

  const form = useForm<SetScheduleSchema>({
    resolver: zodResolver(setScheduleSchema),
    defaultValues: {
      dates: [],
      structure: [EMPTY_PROFESSION_ROW],
      teamMemberIds: [],
      scheduleRequirementIds: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'structure',
  })

  const structureWatch = useWatch({
    control: form.control,
    name: 'structure',
  })

  const usedProfessions = Array.isArray(structureWatch)
    ? structureWatch.map((r) => r.profession).filter(Boolean)
    : []

  async function handleGoToTeamMembers() {
    const isStructureValid = await form.trigger(['dates', 'structure'])
    if (!isStructureValid) return
    setState((previousState) => ({
      ...previousState,
      stage: 'team-members',
      formError: null,
    }))
  }

  function handleBackToStructure() {
    setState((previousState) => ({
      ...previousState,
      stage: 'structure',
      formError: null,
    }))
  }

  async function handleSubmit(data: SetScheduleSchema) {
    try {
      setState((previousState) => ({ ...previousState, formError: null }))
      await setScheduleEntries({
        dates: data.dates,
        structure:
          data.structure as unknown as SetScheduleEntriesInput['structure'],
        teamMemberIds: data.teamMemberIds,
        scheduleRequirementIds: data.scheduleRequirementIds,
      })
      onSuccess()
      onClose()
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.status === 400
          ? parseValidationError(error.response.data)
          : 'Failed to set schedule. Please try again.'
      setState((previousState) => ({
        ...previousState,
        formError: errorMessage,
      }))
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
            <CalendarCog size={16} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-4">Set Schedule</h2>
            <p className="text-xs text-text-tertiary">
              {state.stage === 'structure'
                ? 'Step 1 of 2 — Define dates and structure'
                : 'Step 2 of 2 — Assign team members'}
            </p>
          </div>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-5"
          >
            {state.stage === 'structure' && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-sm font-semibold text-text-secondary">
                    Select Dates
                  </span>
                  <DateSelector />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-heading text-sm font-semibold text-text-secondary">
                    Apply Schedule Requirements
                  </span>
                  <RequirementSelector />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-heading text-sm font-semibold text-text-secondary">
                    Staffing Structure
                  </span>
                  {fields.map((field, index) => (
                    <StructureProfessionRow
                      key={field.id}
                      index={index}
                      onRemove={() => remove(index)}
                      isRemoveDisabled={fields.length === 1}
                      usedProfessions={usedProfessions.map(String)}
                    />
                  ))}
                </div>

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
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleGoToTeamMembers}
                    >
                      Next
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {state.stage === 'team-members' && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-sm font-semibold text-text-secondary">
                    Staffing Structure
                  </span>
                  <StructureSummary />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-heading text-sm font-semibold text-text-secondary">
                    Assign Team Members
                  </span>
                  <TeamMemberSelector />
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
                    onClick={handleBackToStructure}
                  >
                    <ArrowLeft size={14} />
                    Back
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
                      Set Schedule
                    </Button>
                  </div>
                </div>
              </>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
