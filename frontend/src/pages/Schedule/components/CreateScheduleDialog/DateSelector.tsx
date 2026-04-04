import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { generateTwoWeeks } from '../../utils/schedule-dates'
import type { CalendarDay } from '../../utils/schedule-dates'
import type { SetScheduleSchema } from './SetScheduleDialog'

function getDayCellClasses(
  day: CalendarDay,
  isSelected: boolean,
): string {
  const base =
    'flex flex-1 flex-col items-center justify-center rounded-xl py-2.5 transition-all duration-(--transition-base)'

  if (!day.isSettable) {
    return `${base} cursor-not-allowed opacity-30`
  }

  if (isSelected) {
    return `${base} cursor-pointer bg-primary-500 text-neutral-0 shadow-md`
  }

  if (day.isToday) {
    return `${base} cursor-pointer bg-primary-50 ring-1 ring-primary-200 text-text-primary hover:bg-primary-100`
  }

  return `${base} cursor-pointer bg-surface text-text-primary hover:bg-neutral-100`
}

export function DateSelector() {
  const { setValue, control, formState } = useFormContext<SetScheduleSchema>()
  const selectedDates = useWatch({ control, name: 'dates' }) as string[]
  const weeks = useMemo(() => generateTwoWeeks(), [])

  function handleToggleDate(date: string, isSettable: boolean) {
    if (!isSettable) return
    const currentDates = selectedDates ?? []
    const isSelected = currentDates.includes(date)
    const updatedDates = isSelected
      ? currentDates.filter((d) => d !== date)
      : [...currentDates, date]
    setValue('dates', updatedDates)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-tertiary">
          This Week
        </span>
        <div className="flex gap-1.5">
          {weeks.currentWeek.map((day) => {
            const isSelected = (selectedDates ?? []).includes(day.date)
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => handleToggleDate(day.date, day.isSettable)}
                disabled={!day.isSettable}
                className={getDayCellClasses(day, isSelected)}
              >
                <span className="font-heading text-xs font-medium uppercase tracking-wider opacity-70">
                  {day.dayOfWeekShort}
                </span>
                <span className="font-heading text-lg font-bold leading-tight">
                  {day.dayOfMonth}
                </span>
                <span className="text-xs opacity-60">{day.monthShort}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-tertiary">
          Next Week
        </span>
        <div className="flex gap-1.5">
          {weeks.nextWeek.map((day) => {
            const isSelected = (selectedDates ?? []).includes(day.date)
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => handleToggleDate(day.date, day.isSettable)}
                disabled={!day.isSettable}
                className={getDayCellClasses(day, isSelected)}
              >
                <span className="font-heading text-xs font-medium uppercase tracking-wider opacity-70">
                  {day.dayOfWeekShort}
                </span>
                <span className="font-heading text-lg font-bold leading-tight">
                  {day.dayOfMonth}
                </span>
                <span className="text-xs opacity-60">{day.monthShort}</span>
              </button>
            )
          })}
        </div>
      </div>

      {formState.errors.dates?.message && (
        <p className="text-xs font-medium text-error-600">
          {formState.errors.dates.message}
        </p>
      )}
    </div>
  )
}
