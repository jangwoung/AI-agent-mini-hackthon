import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSkillGoalById, getStepsByGoalId } from '@/lib/firebase/firestore'
import { StepList } from '@/app/components/skill/StepList'

const SKILL_LABELS: Record<string, string> = {
  nextjs: 'Next.js',
  go: 'Go',
  gcp: 'GCP',
}

type PageProps = { params: Promise<{ goalId: string }> }

export default async function SkillGoalPage({ params }: PageProps) {
  const { goalId } = await params
  const [goal, steps] = await Promise.all([
    getSkillGoalById(goalId),
    getStepsByGoalId(goalId),
  ])
  if (!goal) notFound()
  const skillLabel = SKILL_LABELS[goal.skillType] ?? goal.skillType
  return (
    <main>
      <p style={{ marginBottom: 16 }}>
        <Link href="/">← トップ</Link>
      </p>
      <StepList
        goalId={goal.id}
        goalText={goal.goalText}
        skillType={goal.skillType}
        skillLabel={skillLabel}
        steps={steps}
      />
    </main>
  )
}
