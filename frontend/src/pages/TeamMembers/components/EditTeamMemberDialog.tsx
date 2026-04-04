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
import { Pencil } from 'lucide-react'
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
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="modal-content card-raised relative z-10 w-full max-w-lg">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
            <Pencil size={16} className="text-primary-600" />
          </div>
          <h3 className="text-heading-4">Edit Team Member</h3>
        </div>

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
            <div className="rounded-xl border border-error-100 bg-error-50 px-4 py-2.5">
              <p className="text-sm font-medium text-error-700">
                {state.formError}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
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
