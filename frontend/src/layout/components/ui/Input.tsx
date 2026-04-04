import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  registration?: UseFormRegisterReturn
}

export function Input({
  label,
  error,
  registration,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id || registration?.name

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-heading text-sm font-semibold text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-(--transition-base) placeholder:text-text-tertiary focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
          error
            ? 'border-error-400 ring-2 ring-error-100'
            : 'border-border hover:border-border-strong'
        } ${className}`}
        {...registration}
        {...rest}
      />
      {error && (
        <span className="text-xs font-medium text-error-600">{error}</span>
      )}
    </div>
  )
}
