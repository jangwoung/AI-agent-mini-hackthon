import { z } from 'zod'

/** Single step in AI step-generation response (no id, goalId, done, createdAt) */
export const AIStepSchema = z.object({
  title: z.string().min(1),
  task: z.string().min(1),
  deliverable: z.string().min(1),
})

/** AI response: exactly 5 steps */
export const StepsResponseSchema = z.array(AIStepSchema).length(5)

export type AIStep = z.infer<typeof AIStepSchema>
export type StepsResponse = z.infer<typeof StepsResponseSchema>

/** AI review response: Keep/Problem/Try/Next */
export const ReviewResponseSchema = z.object({
  keep: z.string().min(1),
  problem: z.string().min(1),
  try: z.string().min(1),
  next: z.string().min(1),
})

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>
