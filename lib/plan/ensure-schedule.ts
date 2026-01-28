/**
 * Initial assignment of scheduledDate for steps that don't have one (002).
 */

import { getStepsByGoalId, updateStepSchedule } from '@/lib/firebase/firestore'
import type { SkillStep } from '@/lib/firebase/types'
import { getTodayYYYYMMDD, addDays } from './dates'
import { MAX_TASKS_PER_DAY } from './constants'

/**
 * Assigns scheduledDate to steps that lack it. Uses index order, from today,
 * respecting daily cap. Already-assigned steps are left unchanged.
 */
export async function ensureSchedule(goalId: string): Promise<void> {
  const steps = await getStepsByGoalId(goalId)
  const today = getTodayYYYYMMDD()
  const unassigned = steps
    .filter((s) => !s.scheduledDate || s.scheduledDate === '')
    .sort((a, b) => a.index - b.index)

  if (unassigned.length === 0) return

  const dayCount = countByDay(steps)
  let cursor = today

  for (const step of unassigned) {
    while ((dayCount[cursor] ?? 0) >= MAX_TASKS_PER_DAY) {
      cursor = addDays(cursor, 1)
    }
    await updateStepSchedule(step.id, {
      scheduledDate: cursor,
      status: 'scheduled',
    })
    dayCount[cursor] = (dayCount[cursor] ?? 0) + 1
  }
}

function countByDay(steps: SkillStep[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of steps) {
    if (!s.scheduledDate) continue
    out[s.scheduledDate] = (out[s.scheduledDate] ?? 0) + 1
  }
  return out
}
