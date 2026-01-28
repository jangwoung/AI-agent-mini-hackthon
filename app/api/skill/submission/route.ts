import { NextResponse } from 'next/server'
import { SubmissionRequestSchema } from '@/lib/models/schemas'
import { validate } from '@/lib/utils/validation'
import { ValidationError, FirestoreError } from '@/lib/utils/errors'
import { createSubmission } from '@/lib/firebase/firestore'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const { stepId, content, contentType } = validate(
      SubmissionRequestSchema,
      body,
      'body'
    ) as { stepId: string; content: string; contentType: 'code' | 'url' }

    const submission = await createSubmission(stepId, content, contentType)

    return NextResponse.json(
      {
        id: submission.id,
        stepId: submission.stepId,
        content: submission.content,
        contentType: submission.contentType,
        createdAt: submission.createdAt.toISOString(),
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
    if (e instanceof FirestoreError) {
      return NextResponse.json(
        { error: 'FirestoreError', message: e.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'InternalError', message: 'Failed to save submission. Please try again.' },
      { status: 500 }
    )
  }
}
