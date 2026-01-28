/**
 * Auto-reschedule: move missed/skipped tasks to next available day (002).
 */

import { getStepsByGoalId, updateStepSchedule } from '@/lib/firebase/firestore'
import type { SkillStep } from '@/lib/firebase/types'
import { getTodayYYYYMMDD, addDays, isBefore } from './dates'
import { MAX_TASKS_PER_DAY, SCHEDULE_VIEW_DAYS } from './constants'

/**
 * Finds missed (scheduledDate < today, status scheduled) and skipped tasks,
 * moves them to the next available day, and updates Firestore.
 */
export async function runReschedule(goalId: string): Promise<void> {
  const steps = await getStepsByGoalId(goalId)
  const today = getTodayYYYYMMDD()

  const dayCount: Record<string, number> = {}
  const toMove: SkillStep[] = []

  for (const s of steps) {
    if (s.scheduledDate) {
      dayCount[s.scheduledDate] = (dayCount[s.scheduledDate] ?? 0) + 1
    }
    const missed =
      s.scheduledDate &&
      isBefore(s.scheduledDate, today) &&
      (s.status === 'scheduled' || !s.status)
    const skipped = s.status === 'skipped'
    if (missed || skipped) {
      toMove.push(s)
    }
  }

  for (const step of toMove) {
    const oldDate = step.scheduledDate!
    dayCount[oldDate] = (dayCount[oldDate] ?? 1) - 1
    if (dayCount[oldDate] <= 0) delete dayCount[oldDate]

    let cursor = today
    const maxDate = addDays(today, SCHEDULE_VIEW_DAYS)
    while (cursor <= maxDate && (dayCount[cursor] ?? 0) >= MAX_TASKS_PER_DAY) {
      cursor = addDays(cursor, 1)
    }
    if (cursor > maxDate) {
      cursor = addDays(today, SCHEDULE_VIEW_DAYS)
    }

    await updateStepSchedule(step.id, {
      scheduledDate: cursor,
      status: 'scheduled',
    })
    dayCount[cursor] = (dayCount[cursor] ?? 0) + 1
  }
}
