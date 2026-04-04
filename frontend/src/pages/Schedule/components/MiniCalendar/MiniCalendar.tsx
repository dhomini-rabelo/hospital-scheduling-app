import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { generateTwoWeeks } from '../../utils/schedule-dates'
import { CalendarDayCell } from './CalendarDayCell'

interface MiniCalendarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

type ActiveWeek = 'current' | 'next'

export function MiniCalendar({
  selectedDate,
  onSelectDate,
}: MiniCalendarProps) {
  const [activeWeek, setActiveWeek] = useState<ActiveWeek>('current')
  const weeks = useMemo(() => generateTwoWeeks(), [])

  const displayedDays =
    activeWeek === 'current' ? weeks.currentWeek : weeks.nextWeek

  const weekLabel = activeWeek === 'current' ? 'This Week' : 'Next Week'

  function handlePreviousWeek() {
    setActiveWeek('current')
  }

  function handleNextWeek() {
    setActiveWeek('next')
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-text-secondary">
          {weekLabel}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePreviousWeek}
            disabled={activeWeek === 'current'}
            className="rounded-lg p-1.5 text-text-tertiary transition-all duration-(--transition-base) hover:bg-neutral-100 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            disabled={activeWeek === 'next'}
            className="rounded-lg p-1.5 text-text-tertiary transition-all duration-(--transition-base) hover:bg-neutral-100 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        {displayedDays.map((day) => (
          <CalendarDayCell
            key={day.date}
            day={day}
            isSelected={day.date === selectedDate}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
