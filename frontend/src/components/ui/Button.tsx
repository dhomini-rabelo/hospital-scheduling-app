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
    'bg-primary-600 text-text-inverse hover:bg-primary-700 disabled:bg-primary-300',
  secondary:
    'border border-border-strong bg-surface text-text-primary hover:bg-neutral-50 disabled:text-text-tertiary',
  danger:
    'bg-error-600 text-text-inverse hover:bg-error-700 disabled:bg-error-300',
  ghost:
    'text-text-secondary hover:bg-neutral-100 hover:text-text-primary disabled:text-text-tertiary',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,color,border-color] duration-[var(--transition-fast)] disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
