import { NextResponse } from 'next/server'
import { ScheduleParamsSchema } from '@/lib/models/schemas'
import { validate } from '@/lib/utils/validation'
import {
  ValidationError,
  NotFoundError,
  FirestoreError,
} from '@/lib/utils/errors'

type RouteParams = { params: Promise<{ goalId: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { goalId } = await params
    validate(ScheduleParamsSchema, { goalId }, 'params')

    const { getStepsByGoalId, getSkillGoalById } =
      await import('@/lib/firebase/firestore')
    const { ensureSchedule } = await import('@/lib/plan/ensure-schedule')
    const { runReschedule } = await import('@/lib/plan/reschedule')
    const { buildScheduleResponse } = await import('@/lib/plan/build-schedule')

    const goal = await getSkillGoalById(goalId)
    if (!goal) {
      return NextResponse.json(
        { error: 'NotFoundError', message: 'Goal not found' },
        { status: 404 }
      )
    }

    await ensureSchedule(goalId)
    await runReschedule(goalId)
    const steps = await getStepsByGoalId(goalId)
    const body = buildScheduleResponse(goalId, steps, goal)

    return NextResponse.json(body, { status: 200 })
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
    console.error('[GET /api/skill/[goalId]/schedule] unexpected error:', e)
    return NextResponse.json(
      {
        error: 'InternalError',
        message: '計画の取得に失敗しました。しばらくしてから再試行してください。',
      },
      { status: 500 }
    )
  }
}
