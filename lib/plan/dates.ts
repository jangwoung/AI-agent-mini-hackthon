/**
 * Date utilities for schedule (002-plan-schedule-reschedule).
 * Uses server date; set TZ (e.g. Asia/Tokyo) for consistent "today".
 */

/**
 * Returns today's date as YYYY-MM-DD.
 * Uses process.env.TZ when set (e.g. Asia/Tokyo).
 */
export function getTodayYYYYMMDD(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Formats a Date as YYYY-MM-DD.
 */
export function formatYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Adds n days to a YYYY-MM-DD string, returns YYYY-MM-DD.
 * Uses local calendar date (same as getTodayYYYYMMDD).
 */
export function addDays(dateStr: string, n: number): string {
  const [y, m, day] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  d.setDate(d.getDate() + n)
  return formatYYYYMMDD(d)
}

/**
 * Returns true if a < b (YYYY-MM-DD string comparison).
 */
export function isBefore(a: string, b: string): boolean {
  return a < b
}
