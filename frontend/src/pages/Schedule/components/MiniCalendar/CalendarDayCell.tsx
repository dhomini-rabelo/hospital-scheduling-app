import type { CalendarDay } from '../../utils/schedule-dates'

interface CalendarDayCellProps {
  day: CalendarDay
  isSelected: boolean
  onSelect: (date: string) => void
}

function getCellClasses(day: CalendarDay, isSelected: boolean): string {
  const base =
    'flex flex-1 flex-col items-center justify-center rounded-xl py-2.5 cursor-pointer transition-all duration-(--transition-base)'

  if (isSelected) {
    return `${base} bg-primary-500 text-neutral-0 shadow-md`
  }

  if (day.isToday) {
    return `${base} bg-primary-50 ring-1 ring-primary-200 text-text-primary hover:bg-primary-100`
  }

  if (day.isPast) {
    return `${base} bg-surface text-text-tertiary hover:bg-neutral-100`
  }

  return `${base} bg-surface text-text-primary hover:bg-neutral-100`
}

export function CalendarDayCell({
  day,
  isSelected,
  onSelect,
}: CalendarDayCellProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(day.date)}
      className={getCellClasses(day, isSelected)}
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
}
