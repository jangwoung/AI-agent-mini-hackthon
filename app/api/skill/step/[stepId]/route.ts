import { NextResponse } from 'next/server'
import { StepCompletionRequestSchema } from '@/lib/models/schemas'
import { validate } from '@/lib/utils/validation'
import { ValidationError, NotFoundError, FirestoreError } from '@/lib/utils/errors'
import { updateStepCompletion, getSkillStepById } from '@/lib/firebase/firestore'

type RouteParams = { params: Promise<{ stepId: string }> }

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { stepId } = await params
    const body = (await request.json()) as unknown
    const { done } = validate(StepCompletionRequestSchema, body, 'body') as {
      done: boolean
    }

    const step = await getSkillStepById(stepId)
    if (!step) {
      return NextResponse.json(
        { error: 'NotFoundError', message: 'Step not found' },
        { status: 404 }
      )
    }

    await updateStepCompletion(stepId, done)

    return NextResponse.json({ success: true, done }, { status: 200 })
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(
        { error: 'ValidationError', message: e.message, details: { field: e.field } },
        { status: 400 }
      )
    }
    if (e instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'NotFoundError', message: e.message },
        { status: 404 }
      )
    }
    if (e instanceof FirestoreError) {
      return NextResponse.json(
        { error: 'FirestoreError', message: e.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'InternalError', message: 'Failed to update step. Please try again.' },
      { status: 500 }
    )
  }
}
