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
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-neutral-100 text-neutral-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  info: 'bg-info-100 text-info-700',
}

export function Badge({ variant = 'secondary', children }: BadgeProps) {
  return <span className={`badge ${VARIANT_CLASSES[variant]}`}>{children}</span>
}
