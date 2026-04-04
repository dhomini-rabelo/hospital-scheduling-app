import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-neutral-900/50"
        onClick={onCancel}
        onKeyDown={undefined}
        role="presentation"
      />
      <div className="card-raised relative z-10 w-full max-w-md">
        <h3 className="text-heading-4 mb-2">{title}</h3>
        <p className="text-body-sm mb-6 text-text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
