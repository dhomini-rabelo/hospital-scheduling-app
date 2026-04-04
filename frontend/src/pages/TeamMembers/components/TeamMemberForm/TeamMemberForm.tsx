import { Button } from '@/components/ui/Button'
import { createTeamMembers } from '@/server/api/team-members'
import { Profession } from '@/server/types/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
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

interface TeamMemberFormProps {
  onSuccess: () => void
}

const EMPTY_ROW = { name: '', profession: '' as Profession, specialty: '' }

interface TeamMemberFormState {
  formError: string | null
}

export function TeamMemberForm({ onSuccess }: TeamMemberFormProps) {
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
    } catch {
      setState({ formError: 'Failed to create team members. Please try again.' })
    }
  }

  function handleAddRow() {
    append(EMPTY_ROW)
  }

  return (
    <div className="card">
      <h2 className="text-heading-4 mb-4">Add Team Members</h2>

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
            <p className="text-sm text-error-600">{state.formError}</p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddRow}
            >
              <Plus size={16} />
              Add Row
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={form.formState.isSubmitting}
            >
              Submit All
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
