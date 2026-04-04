import { ValidationError } from '@/modules/domain/errors'

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export function getDateReferencesForDate(dateStr: string): string[] {
  const date = new Date(`${dateStr}T00:00:00Z`)
  const dayOfWeek = date.getUTCDay()
  const dayOfMonth = date.getUTCDate()

  const references: string[] = []

  references.push(DAY_NAMES[dayOfWeek])

  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    references.push('weekday')
  } else {
    references.push('weekend')
  }

  const suffix = getOrdinalSuffix(dayOfMonth)
  references.push(`${dayOfMonth}${suffix} of the month`)

  return references
}

function formatDateToISO(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMondayOfWeek(date: Date): Date {
  const result = new Date(date)
  const dayOfWeek = result.getUTCDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  result.setUTCDate(result.getUTCDate() - daysToMonday)
  return result
}

function getSundayOfWeek(date: Date): Date {
  const monday = getMondayOfWeek(date)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return sunday
}

export function getAllowedSetRange(): { start: string; end: string } {
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

export function getAllowedViewRange(): { start: string; end: string } {
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

export function validateDatesInSetRange(dates: string[]): void {
  const range = getAllowedSetRange()

  const invalidDates = dates.filter(
    (date) => date < range.start || date > range.end,
  )

  if (invalidDates.length > 0) {
    throw new ValidationError({
      errorField: 'dates',
      code: 'DATES_OUTSIDE_ALLOWED_RANGE',
      variables: invalidDates,
    })
  }
}
