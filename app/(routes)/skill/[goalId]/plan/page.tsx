import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSkillGoalById, getStepsByGoalId } from '@/lib/firebase/firestore'
import { ensureSchedule } from '@/lib/plan/ensure-schedule'
import { runReschedule } from '@/lib/plan/reschedule'
import { buildScheduleResponse } from '@/lib/plan/build-schedule'
import { ScheduleView } from '@/app/components/plan/ScheduleView'

type PageProps = { params: Promise<{ goalId: string }> }

export default async function PlanPage({ params }: PageProps) {
  const { goalId } = await params
  const goal = await getSkillGoalById(goalId)
  if (!goal) notFound()

  await ensureSchedule(goalId)
  await runReschedule(goalId)
  const steps = await getStepsByGoalId(goalId)
  const schedule = buildScheduleResponse(goalId, steps, goal)

  return (
    <main>
      <p style={{ marginBottom: 16 }}>
        <Link href={`/skill/${goalId}`}>← ステップ一覧に戻る</Link>
      </p>
      <ScheduleView schedule={schedule} goalId={goalId} />
    </main>
  )
}
