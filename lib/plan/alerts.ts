/**
 * Deadline and duration overflow alerts (002).
 */

import type { SkillGoal } from '@/lib/firebase/types'
import type { DayItem } from './types'
import { addDays } from './dates'

/**
 * Returns alert messages if any task is scheduled on or after the goal deadline.
 */
export function checkDeadlineOverflow(
  goal: SkillGoal,
  days: DayItem[]
): string[] {
  if (!goal.deadline) return []
  const out: string[] = []
  for (const d of days) {
    if (d.date > goal.deadline) {
      for (const _ of d.tasks) {
        out.push(
          `期限（${goal.deadline}）を超える日にタスクが配置されています: ${d.date}`
        )
        break
      }
    }
  }
  return out
}

/**
 * Returns alert messages if any task is scheduled after startDate + duration.
 */
export function checkDurationOverflow(
  goal: SkillGoal,
  days: DayItem[]
): string[] {
  if (!goal.startDate || goal.duration == null) return []
  const end = addDays(goal.startDate, Math.max(0, goal.duration - 1))
  const out: string[] = []
  for (const d of days) {
    if (d.date > end) {
      for (const _ of d.tasks) {
        out.push(
          `学習期間（${goal.startDate}〜${end}）を超える日にタスクが配置されています: ${d.date}`
        )
        break
      }
    }
  }
  return out
}
