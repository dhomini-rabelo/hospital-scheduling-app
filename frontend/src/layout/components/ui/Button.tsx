import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/20 disabled:bg-primary-300 disabled:shadow-none',
  secondary:
    'border border-border bg-surface text-text-primary hover:bg-neutral-50 hover:border-border-strong active:bg-neutral-100 disabled:text-text-tertiary disabled:bg-neutral-50',
  danger:
    'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-sm shadow-error-600/15 disabled:bg-error-300 disabled:shadow-none',
  ghost:
    'text-text-secondary hover:bg-neutral-100 hover:text-text-primary active:bg-neutral-200 disabled:text-text-tertiary',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-(--transition-base) disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
