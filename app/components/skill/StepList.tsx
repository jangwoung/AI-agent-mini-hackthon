import Link from 'next/link'
import { StepCard } from './StepCard'
import type { SkillStep } from '@/lib/firebase/types'

type StepListProps = {
  goalId: string
  goalText: string
  skillType: string
  skillLabel: string
  steps: SkillStep[]
}

export function StepList({
  goalId,
  goalText,
  skillType,
  skillLabel,
  steps,
}: StepListProps) {
  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        {goalText}
      </h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
        {skillLabel}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step) => (
          <li key={step.id}>
            <StepCard goalId={goalId} step={step} />
          </li>
        ))}
      </ul>
    </>
  )
}
