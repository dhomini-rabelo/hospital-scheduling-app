import type { SelectHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  registration?: UseFormRegisterReturn
}

export function Select({
  label,
  error,
  options,
  placeholder,
  registration,
  className = '',
  id,
  ...rest
}: SelectProps) {
  const selectId = id || registration?.name

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="font-heading text-sm font-semibold text-text-secondary"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-(--transition-base) focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-text-tertiary ${
          error
            ? 'border-error-400 ring-2 ring-error-100'
            : 'border-border hover:border-border-strong'
        } ${className}`}
        {...registration}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-error-600">{error}</span>
      )}
    </div>
  )
}
