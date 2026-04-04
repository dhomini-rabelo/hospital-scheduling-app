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
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg border px-3 py-2 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-[var(--transition-fast)] placeholder:text-text-tertiary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${
          error ? 'border-error-500' : 'border-border'
        } ${className}`}
        {...registration}
        {...rest}
      />
      {error && <span className="text-xs text-error-600">{error}</span>}
    </div>
  )
}
