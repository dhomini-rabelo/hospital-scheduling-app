import { Button } from '@/components/ui/Button'
import { createTeamMembers } from '@/server/api/team-members'
import { Profession } from '@/server/types/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Send } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { TeamMemberFormRow } from './TeamMemberFormRow'

const teamMemberItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  profession: z.nativeEnum(Profession, {
    message: 'Select a profession',
  }),
  specialty: z.string().min(1, 'Select a specialty'),
})

const teamMemberFormSchema = z.object({
  items: z.array(teamMemberItemSchema).min(1),
})

export type TeamMemberFormSchema = z.infer<typeof teamMemberFormSchema>

interface CreateTeamMemberDialogProps {
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_ROW = { name: '', profession: '' as Profession, specialty: '' }

interface TeamMemberFormState {
  formError: string | null
}

export function CreateTeamMemberDialog({ onClose, onSuccess }: CreateTeamMemberDialogProps) {
  const [state, setState] = useState<TeamMemberFormState>({
    formError: null,
  })

  const form = useForm<TeamMemberFormSchema>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      items: [EMPTY_ROW],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  async function handleSubmit(data: TeamMemberFormSchema) {
    try {
      setState({ formError: null })
      await createTeamMembers(data.items)
      form.reset({ items: [EMPTY_ROW] })
      onSuccess()
      onClose()
    } catch {
      setState({ formError: 'Failed to create team members. Please try again.' })
    }
  }

  function handleAddRow() {
    append(EMPTY_ROW)
  }

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="modal-content card-raised relative z-10 w-full max-w-2xl">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
            <Plus size={16} className="text-primary-600" />
          </div>
          <h2 className="text-heading-4">Add Team Members</h2>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <TeamMemberFormRow
                  key={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                  isRemoveDisabled={fields.length === 1}
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
                onClick={handleAddRow}
              >
                <Plus size={16} />
                Add Row
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
                  Submit All
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
