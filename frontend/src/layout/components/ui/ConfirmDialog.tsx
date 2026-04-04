import { AlertTriangle } from 'lucide-react'
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
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={undefined}
        role="presentation"
      />
      <div className="modal-content card-raised relative z-10 w-full max-w-md">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-error-50 ring-1 ring-error-100">
          <AlertTriangle size={20} className="text-error-600" />
        </div>
        <h3 className="text-heading-4 mb-1.5">{title}</h3>
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
