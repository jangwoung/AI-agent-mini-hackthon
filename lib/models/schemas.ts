import { z } from 'zod'

export const SkillTypeSchema = z.enum(['nextjs', 'go', 'gcp'])

export const SkillGoalSchema = z.object({
  skillType: SkillTypeSchema,
  goalText: z.string().min(10).max(500).trim(),
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
