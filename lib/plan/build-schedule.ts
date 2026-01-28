/**
 * Build 14-day schedule response from steps (002).
 */

import type { SkillGoal, SkillStep } from '@/lib/firebase/types'
import type { ScheduleResponse, DayItem, TaskItem } from './types'
import type { StepStatus } from './types'
import { getTodayYYYYMMDD, addDays, isBefore } from './dates'
import { SCHEDULE_VIEW_DAYS } from './constants'
import {
  checkDeadlineOverflow,
  checkDurationOverflow,
} from './alerts'

export function buildScheduleResponse(
  goalId: string,
  steps: SkillStep[],
  goal: SkillGoal | null
): ScheduleResponse {
  const today = getTodayYYYYMMDD()
  const days: DayItem[] = []

  for (let i = 0; i < SCHEDULE_VIEW_DAYS; i++) {
    const date = addDays(today, i)
    const tasks = steps
      .filter((s) => s.scheduledDate === date)
      .sort((a, b) => a.index - b.index)
      .map((s) => toTaskItem(s, today))
    days.push({ date, tasks })
  }

  const alerts: string[] = []
  if (goal) {
    alerts.push(...checkDeadlineOverflow(goal, days))
    alerts.push(...checkDurationOverflow(goal, days))
  }

  return { goalId, days, alerts }
}

function toTaskItem(s: SkillStep, today: string): TaskItem {
  let status: StepStatus =
    (s.status as StepStatus) ?? 'scheduled'
  if (
    status === 'scheduled' &&
    s.scheduledDate &&
    isBefore(s.scheduledDate, today)
  ) {
    status = 'missed'
  }
  return {
    stepId: s.id,
    goalId: s.goalId,
    index: s.index,
    title: s.title,
    status,
    scheduledDate: s.scheduledDate ?? today,
    ...(s.estimatedMinutes != null && { estimatedMinutes: s.estimatedMinutes }),
    done: s.done ?? false,
  }
}
