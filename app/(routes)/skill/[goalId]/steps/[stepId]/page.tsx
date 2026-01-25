import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getSkillGoalById,
  getSkillStepById,
  getSubmissionByStepId,
  getReviewByStepId,
} from '@/lib/firebase/firestore'
import { StepDetail } from '@/app/components/skill/StepDetail'

type PageProps = {
  params: Promise<{ goalId: string; stepId: string }>
}

export default async function StepDetailPage({ params }: PageProps) {
  const { goalId, stepId } = await params
  const [goal, step, submission, review] = await Promise.all([
    getSkillGoalById(goalId),
    getSkillStepById(stepId),
    getSubmissionByStepId(stepId),
    getReviewByStepId(stepId),
  ])

  if (!goal || !step || step.goalId !== goalId) {
    notFound()
  }

  return (
    <main>
      <p style={{ marginBottom: 16 }}>
        <Link href={`/skill/${goalId}`}>← ステップ一覧に戻る</Link>
      </p>
      <StepDetail
        goal={goal}
        step={step}
        submission={submission}
        review={review}
      />
    </main>
  )
}
