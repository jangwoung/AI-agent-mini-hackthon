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
