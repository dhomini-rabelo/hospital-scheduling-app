const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export interface CalendarDay {
  date: string
  dayOfMonth: number
  dayOfWeekShort: string
  monthShort: string
  isToday: boolean
  isPast: boolean
  isSettable: boolean
}

export function formatDateToISO(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMondayOfWeek(date: Date): Date {
  const result = new Date(date)
  const dayOfWeek = result.getUTCDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  result.setUTCDate(result.getUTCDate() - daysToMonday)
  return result
}

export function getSundayOfWeek(date: Date): Date {
  const monday = getMondayOfWeek(date)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return sunday
}

export function getTodayISO(): string {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return formatDateToISO(today)
}

export function getViewRange(): { start: string; end: string } {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const currentWeekMonday = getMondayOfWeek(today)

  const nextWeekDay = new Date(today)
  nextWeekDay.setUTCDate(today.getUTCDate() + 7)
  const nextWeekSunday = getSundayOfWeek(nextWeekDay)

  return {
    start: formatDateToISO(currentWeekMonday),
    end: formatDateToISO(nextWeekSunday),
  }
}

export function getSetRange(): { start: string; end: string } {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const nextWeekDay = new Date(today)
  nextWeekDay.setUTCDate(today.getUTCDate() + 7)
  const nextWeekSunday = getSundayOfWeek(nextWeekDay)

  return {
    start: formatDateToISO(today),
    end: formatDateToISO(nextWeekSunday),
  }
}

function buildCalendarDay(date: Date, todayISO: string, setRange: { start: string; end: string }): CalendarDay {
  const dateISO = formatDateToISO(date)
  return {
    date: dateISO,
    dayOfMonth: date.getUTCDate(),
    dayOfWeekShort: DAY_NAMES_SHORT[date.getUTCDay()],
    monthShort: MONTH_NAMES_SHORT[date.getUTCMonth()],
    isToday: dateISO === todayISO,
    isPast: dateISO < todayISO,
    isSettable: dateISO >= setRange.start && dateISO <= setRange.end,
  }
}

export function generateWeekDays(
  weekStartMonday: Date,
  todayISO: string,
  setRange: { start: string; end: string },
): CalendarDay[] {
  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStartMonday)
    day.setUTCDate(weekStartMonday.getUTCDate() + i)
    days.push(buildCalendarDay(day, todayISO, setRange))
  }
  return days
}

export function generateTwoWeeks(): {
  currentWeek: CalendarDay[]
  nextWeek: CalendarDay[]
} {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayISO = formatDateToISO(today)
  const setRange = getSetRange()

  const currentWeekMonday = getMondayOfWeek(today)
  const nextWeekMonday = new Date(currentWeekMonday)
  nextWeekMonday.setUTCDate(currentWeekMonday.getUTCDate() + 7)

  return {
    currentWeek: generateWeekDays(currentWeekMonday, todayISO, setRange),
    nextWeek: generateWeekDays(nextWeekMonday, todayISO, setRange),
  }
}

export function generateDateRange(
  startDate: string,
  endDate: string,
): string[] {
  const dates: string[] = []
  const current = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)

  while (current <= end) {
    dates.push(formatDateToISO(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`)
  const dayName = DAY_NAMES_SHORT[date.getUTCDay()]
  const month = MONTH_NAMES_SHORT[date.getUTCMonth()]
  const day = date.getUTCDate()
  return `${dayName}, ${month} ${day}`
}
