/**
 * Types for schedule view and auto-reschedule (002-plan-schedule-reschedule).
 */

export type StepStatus = 'scheduled' | 'done' | 'missed' | 'skipped'

export interface ScheduleResponse {
  goalId: string
  days: DayItem[]
  alerts: string[]
}

export interface DayItem {
  date: string
  tasks: TaskItem[]
}

export interface TaskItem {
  stepId: string
  goalId: string
  index: number
  title: string
  status: StepStatus
  scheduledDate: string
  estimatedMinutes?: number
  done: boolean
}
