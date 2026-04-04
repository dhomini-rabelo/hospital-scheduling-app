import type { ReactNode } from 'react'

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 ring-1 ring-primary-200/60',
  secondary: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/60',
  success: 'bg-success-50 text-success-700 ring-1 ring-success-200/60',
  warning: 'bg-warning-50 text-warning-700 ring-1 ring-warning-200/60',
  error: 'bg-error-50 text-error-700 ring-1 ring-error-200/60',
  info: 'bg-info-50 text-info-700 ring-1 ring-info-200/60',
}

export function Badge({ variant = 'secondary', children }: BadgeProps) {
  return <span className={`badge ${VARIANT_CLASSES[variant]}`}>{children}</span>
}
