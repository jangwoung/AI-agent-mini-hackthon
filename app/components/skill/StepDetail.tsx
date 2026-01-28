import { SubmissionForm } from './SubmissionForm'
import { CompletionCheckbox } from './CompletionCheckbox'
import { ReviewDisplay } from './ReviewDisplay'
import type { SkillGoal, SkillStep, Submission, Review } from '@/lib/firebase/types'

type StepDetailProps = {
  goal: SkillGoal
  step: SkillStep
  submission: Submission | null
  review: Review | null
}

export function StepDetail({
  goal,
  step,
  submission,
  review,
}: StepDetailProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: step.done ? '#22c55e' : '#e5e7eb',
              color: step.done ? '#fff' : '#6b7280',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {step.done ? '✓' : step.index}
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            {step.title}
          </h1>
        </div>
        <CompletionCheckbox stepId={step.id} done={step.done} />
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>タスク</h2>
        <p style={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {step.task}
        </p>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>成果物</h2>
        <p style={{ color: '#374151', lineHeight: 1.6 }}>{step.deliverable}</p>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>提出物</h2>
        <SubmissionForm step={step} goal={goal} submission={submission} />
      </div>

      {review && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            AI レビュー
          </h2>
          <ReviewDisplay review={review} />
        </div>
      )}
    </div>
  )
}
