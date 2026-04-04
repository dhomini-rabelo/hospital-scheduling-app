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
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-(--transition-fast) focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${
          error ? 'border-error-500' : 'border-border'
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
      {error && <span className="text-xs text-error-600">{error}</span>}
    </div>
  )
}
