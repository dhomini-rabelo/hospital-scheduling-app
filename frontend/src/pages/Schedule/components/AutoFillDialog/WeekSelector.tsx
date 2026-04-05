import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import {
  formatDateDisplay,
  formatDateToISO,
  getMondayOfWeek,
  getSundayOfWeek,
} from '../../utils/schedule-dates'

interface WeekOption {
  mondayISO: string
  sundayISO: string
  label: string
}

function buildWeekOptions(): WeekOption[] {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const currentMonday = getMondayOfWeek(today)
  const currentSunday = getSundayOfWeek(today)

  const nextMonday = new Date(currentMonday)
  nextMonday.setUTCDate(currentMonday.getUTCDate() + 7)
  const nextSunday = getSundayOfWeek(nextMonday)

  return [
    {
      mondayISO: formatDateToISO(currentMonday),
      sundayISO: formatDateToISO(currentSunday),
      label: 'This Week',
    },
    {
      mondayISO: formatDateToISO(nextMonday),
      sundayISO: formatDateToISO(nextSunday),
      label: 'Next Week',
    },
  ]
}

interface WeekSelectorProps {
  selectedWeek: string | null
  onSelectWeek: (mondayISO: string) => void
}

export function WeekSelector({
  selectedWeek,
  onSelectWeek,
}: WeekSelectorProps) {
  const weekOptions = useMemo(() => buildWeekOptions(), [])

  return (
    <div className="flex flex-col gap-2">
      {weekOptions.map((option) => {
        const isSelected = selectedWeek === option.mondayISO
        return (
          <button
            key={option.mondayISO}
            type="button"
            onClick={() => onSelectWeek(option.mondayISO)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-(--transition-base) ${
              isSelected
                ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-500'
                : 'border-border/40 bg-surface hover:bg-neutral-50'
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isSelected ? 'bg-primary-200' : 'bg-neutral-100'
              }`}
            >
              <Calendar
                size={16}
                className={isSelected ? 'text-primary-700' : 'text-text-tertiary'}
              />
            </div>
            <div className="flex-1">
              <p
                className={`font-heading text-sm font-semibold ${
                  isSelected ? 'text-primary-700' : 'text-text-primary'
                }`}
              >
                {option.label}
              </p>
              <p className="text-xs text-text-tertiary">
                {formatDateDisplay(option.mondayISO)} — {formatDateDisplay(option.sundayISO)}
              </p>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 bg-transparent'
              }`}
            >
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
