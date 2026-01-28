import { z } from 'zod'

export const SkillTypeSchema = z.enum(['nextjs', 'go', 'gcp'])

export const SkillGoalSchema = z.object({
  skillType: SkillTypeSchema,
  goalText: z.string().min(10).max(500).trim(),
})

/** API: POST /api/skill/generate request body */
export const GenerateRequestSchema = SkillGoalSchema.pick({
  skillType: true,
  goalText: true,
})

export const SkillStepSchema = z.object({
  goalId: z.string().uuid(),
  index: z.number().int().min(1).max(5),
  title: z.string().min(5).max(200).trim(),
  task: z.string().min(20).max(2000).trim(),
  deliverable: z.string().min(10).max(500).trim(),
  done: z.boolean().default(false),
})

export const SubmissionContentTypeSchema = z.enum(['code', 'url'])

export const SubmissionSchema = z
  .object({
    stepId: z.string().uuid(),
    content: z.string().min(1).max(100000),
    contentType: SubmissionContentTypeSchema,
  })
  .refine(
    (data) => {
      if (data.contentType === 'url') {
        try {
          new URL(data.content)
          return true
        } catch {
          return false
        }
      }
      return true
    },
    { message: 'Content must be a valid URL when contentType is "url"' }
  )

export const ReviewSchema = z.object({
  stepId: z.string().uuid(),
  keep: z.string().min(10).max(2000).trim(),
  problem: z.string().min(10).max(2000).trim(),
  try: z.string().min(10).max(2000).trim(),
  next: z.string().min(10).max(2000).trim(),
})

/** API: POST /api/skill/submission request body (stepId = Firestore doc ID, not UUID) */
export const SubmissionRequestSchema = z
  .object({
    stepId: z.string().min(1),
    content: z.string().min(1).max(100000),
    contentType: SubmissionContentTypeSchema,
  })
  .refine(
    (data) => {
      if (data.contentType === 'url') {
        try {
          new URL(data.content)
          return true
        } catch {
          return false
        }
      }
      return true
    },
    { message: 'Content must be a valid URL when contentType is "url"' }
  )

/** API: PATCH /api/skill/step/[stepId] request body */
export const StepCompletionRequestSchema = z.object({
  done: z.boolean(),
})

/** 002: Step schedule status */
export const StepStatusSchema = z.enum([
  'scheduled',
  'done',
  'missed',
  'skipped',
])

/** 002: YYYY-MM-DD date string */
export const DateYYYYMMDDSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/** 002: Schedule API params (goalId from path) */
export const ScheduleParamsSchema = z.object({
  goalId: z.string().min(1),
})

/** 002: PATCH /api/skill/step/[stepId] extended body (done | status | scheduledDate) */
export const StepUpdateRequestSchema = z
  .object({
    done: z.boolean().optional(),
    status: StepStatusSchema.optional(),
    scheduledDate: DateYYYYMMDDSchema.optional(),
  })
  .refine(
    (d) =>
      d.done !== undefined ||
      d.status !== undefined ||
      d.scheduledDate !== undefined,
    { message: 'At least one of done, status, scheduledDate required' }
  )

/** API: POST /api/skill/review request body */
export const ReviewRequestSchema = z.object({
  stepId: z.string().min(1),
  skillType: SkillTypeSchema,
  goalText: z.string().min(10).max(500).trim(),
  stepTitle: z.string().min(5).max(200).trim(),
  stepTask: z.string().min(20).max(2000).trim(),
  deliverable: z.string().min(10).max(500).trim(),
  submission: z.string().min(1).max(100000),
})
