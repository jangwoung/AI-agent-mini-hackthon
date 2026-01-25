import { NextResponse } from 'next/server'
import { ReviewRequestSchema } from '@/lib/models/schemas'
import { validate } from '@/lib/utils/validation'
import { ValidationError, AIServiceError } from '@/lib/utils/errors'
import type { SkillType } from '@/lib/firebase/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const payload = validate(ReviewRequestSchema, body, 'body') as {
      stepId: string
      skillType: SkillType
      goalText: string
      stepTitle: string
      stepTask: string
      deliverable: string
      submission: string
    }

    const { getSkillStepById, getSubmissionByStepId, createReview } =
      await import('@/lib/firebase/firestore')
    const { generateReview } = await import('@/lib/ai/generate-review')

    const [step, submission] = await Promise.all([
      getSkillStepById(payload.stepId),
      getSubmissionByStepId(payload.stepId),
    ])

    if (!step || !submission) {
      return NextResponse.json(
        {
          error: 'NotFoundError',
          message: 'Step or submission not found',
          details: { stepId: payload.stepId },
        },
        { status: 404 }
      )
    }

    const reviewData = await generateReview(
      payload.skillType,
      payload.goalText,
      payload.stepTitle,
      payload.stepTask,
      payload.deliverable,
      payload.submission
    )

    const review = await createReview(
      payload.stepId,
      reviewData.keep,
      reviewData.problem,
      reviewData.try,
      reviewData.next
    )

    return NextResponse.json(
      {
        reviewId: review.id,
        stepId: review.stepId,
        keep: review.keep,
        problem: review.problem,
        try: review.try,
        next: review.next,
        createdAt: review.createdAt.toISOString(),
      },
      { status: 200 }
    )
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'ValidationError',
          message: e.message,
          details: { field: e.field },
        },
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
    console.error('[POST /api/skill/review] unexpected error:', e)
    return NextResponse.json(
      {
        error: 'InternalError',
        message: 'Failed to generate review. Please try again.',
      },
      { status: 500 }
    )
  }
}
