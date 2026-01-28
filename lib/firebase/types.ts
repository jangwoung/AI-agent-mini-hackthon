export type SkillType = 'nextjs' | 'go' | 'gcp'

export interface SkillGoalScheduleFields {
  deadline?: string
  startDate?: string
  duration?: number
}

export interface SkillGoal {
  id: string
  skillType: SkillType
  goalText: string
  createdAt: Date
  userId?: string
  deadline?: string
  startDate?: string
  duration?: number
}

export type StepStatus = 'scheduled' | 'done' | 'missed' | 'skipped'

export interface SkillStepScheduleFields {
  scheduledDate?: string
  status?: StepStatus
  estimatedMinutes?: number
}

export interface SkillStep {
  id: string
  goalId: string
  index: number // 1-5
  title: string
  task: string
  deliverable: string
  done: boolean
  createdAt: Date
  scheduledDate?: string
  status?: StepStatus
  estimatedMinutes?: number
}

export type SubmissionContentType = 'code' | 'url'

export interface Submission {
  id: string
  stepId: string
  content: string
  contentType: SubmissionContentType
  createdAt: Date
}

export interface Review {
  id: string
  stepId: string
  keep: string
  problem: string
  try: string
  next: string
  createdAt: Date
}
