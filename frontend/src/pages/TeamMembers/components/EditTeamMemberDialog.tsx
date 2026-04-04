import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { updateTeamMember } from '@/server/api/team-members'
import type { TeamMember } from '@/server/types/entities'
import {
  PROFESSION_LABELS,
  PROFESSION_SPECIALTIES,
  Profession,
  formatSpecialtyLabel,
} from '@/server/types/entities'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

const editTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  profession: z.nativeEnum(Profession, {
    message: 'Select a profession',
  }),
  specialty: z.string().min(1, 'Select a specialty'),
})

type EditTeamMemberSchema = z.infer<typeof editTeamMemberSchema>

const PROFESSION_OPTIONS = Object.values(Profession).map((value) => ({
  value,
  label: PROFESSION_LABELS[value],
}))

interface EditTeamMemberDialogProps {
  teamMember: TeamMember
  onClose: () => void
  onSuccess: () => void
}

interface EditTeamMemberDialogState {
  formError: string | null
}

export function EditTeamMemberDialog({
  teamMember,
  onClose,
  onSuccess,
}: EditTeamMemberDialogProps) {
  const [state, setState] = useState<EditTeamMemberDialogState>({
    formError: null,
  })

  const {
    register,
    handleSubmit,
    formState,
    control,
    setValue,
  } = useForm<EditTeamMemberSchema>({
    resolver: zodResolver(editTeamMemberSchema),
    defaultValues: {
      name: teamMember.name,
      profession: teamMember.profession,
      specialty: teamMember.specialty,
    },
  })

  const profession = useWatch({ control, name: 'profession' })

  const specialtyOptions = profession
    ? (PROFESSION_SPECIALTIES[profession] ?? []).map((value) => ({
        value,
        label: formatSpecialtyLabel(value),
      }))
    : []

  useEffect(() => {
    if (profession !== teamMember.profession) {
      setValue('specialty', '')
    }
  }, [profession, teamMember.profession, setValue])

  async function handleFormSubmit(data: EditTeamMemberSchema) {
    try {
      setState({ formError: null })
      await updateTeamMember(teamMember.id, data)
      onSuccess()
      onClose()
    } catch {
      setState({ formError: 'Failed to update team member. Please try again.' })
    }
  }

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center">
      <div
        className="absolute inset-0 bg-neutral-900/50"
        onClick={onClose}
        role="presentation"
      />
      <div className="card-raised relative z-10 w-full max-w-lg">
        <h3 className="text-heading-4 mb-4">Edit Team Member</h3>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            label="Name"
            registration={register('name')}
            error={formState.errors.name?.message}
          />
          <Select
            label="Profession"
            options={PROFESSION_OPTIONS}
            placeholder="Select profession"
            registration={register('profession')}
            error={formState.errors.profession?.message}
          />
          <Select
            label="Specialty"
            options={specialtyOptions}
            placeholder="Select specialty"
            registration={register('specialty')}
            error={formState.errors.specialty?.message}
            disabled={!profession}
          />

          {state.formError && (
            <p className="text-sm text-error-600">{state.formError}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
