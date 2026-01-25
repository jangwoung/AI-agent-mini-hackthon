import { NextResponse } from 'next/server'
import { GenerateRequestSchema } from '@/lib/models/schemas'
import { validate } from '@/lib/utils/validation'
import {
  ValidationError,
  AIServiceError,
} from '@/lib/utils/errors'
import type { SkillType } from '@/lib/firebase/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const { skillType, goalText } = validate(
      GenerateRequestSchema,
      body,
      'body'
    ) as { skillType: SkillType; goalText: string }

    const { generateSteps } = await import('@/lib/ai/generate-steps')
    const { createSkillGoal, createSkillSteps } = await import(
      '@/lib/firebase/firestore'
    )

    const aiSteps = await generateSteps(skillType, goalText)

    const goal = await createSkillGoal(skillType, goalText)
    const steps = await createSkillSteps(goal.id, aiSteps.map((s, i) => ({
      index: i + 1,
      title: s.title,
      task: s.task,
      deliverable: s.deliverable,
    })))

    return NextResponse.json(
      {
        goalId: goal.id,
        steps: steps.map((s) => ({
          id: s.id,
          goalId: s.goalId,
          index: s.index,
          title: s.title,
          task: s.task,
          deliverable: s.deliverable,
          done: s.done,
          createdAt: s.createdAt.toISOString(),
        })),
      },
      { status: 200 }
    )
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(
        { error: 'ValidationError', message: e.message, details: { field: e.field } },
        { status: 400 }
      )
    }
    if (e instanceof AIServiceError) {
      return NextResponse.json(
        {
          error: 'AIServiceError',
          message: e.message,
          details: { retryable: e.retryable, retryAfter: e.retryAfter },
        },
        { status: 500 }
      )
    }
    console.error('[POST /api/skill/generate] unexpected error:', e)
    return NextResponse.json(
      { error: 'InternalError', message: 'Failed to generate steps. Please try again.' },
      { status: 500 }
    )
  }
}
