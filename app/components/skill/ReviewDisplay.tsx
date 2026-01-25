import type { Review } from '@/lib/firebase/types'

type ReviewDisplayProps = { review: Review }

export function ReviewDisplay({ review }: ReviewDisplayProps) {
  const sectionStyle = {
    marginBottom: 16,
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#fafafa',
  }
  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6b7280',
    marginBottom: 8,
  }
  const textStyle = {
    color: '#374151',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ ...sectionStyle, borderLeft: '4px solid #22c55e' }}>
        <div style={labelStyle}>Keep（良い点）</div>
        <div style={textStyle}>{review.keep}</div>
      </div>
      <div style={{ ...sectionStyle, borderLeft: '4px solid #ef4444' }}>
        <div style={labelStyle}>Problem（改善点）</div>
        <div style={textStyle}>{review.problem}</div>
      </div>
      <div style={{ ...sectionStyle, borderLeft: '4px solid #f59e0b' }}>
        <div style={labelStyle}>Try（試してみて）</div>
        <div style={textStyle}>{review.try}</div>
      </div>
      <div style={{ ...sectionStyle, borderLeft: '4px solid #2563eb' }}>
        <div style={labelStyle}>Next（次に）</div>
        <div style={textStyle}>{review.next}</div>
      </div>
    </div>
  )
}
