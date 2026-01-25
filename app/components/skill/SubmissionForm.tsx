'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toUserFriendlyError } from '@/lib/utils/errors'
import type { SkillGoal, SkillStep, Submission } from '@/lib/firebase/types'

type SubmissionFormProps = {
  step: SkillStep
  goal: SkillGoal
  submission: Submission | null
}

export function SubmissionForm({
  step,
  goal,
  submission,
}: SubmissionFormProps) {
  const router = useRouter()
  const [contentType, setContentType] = useState<'code' | 'url'>(
    submission?.contentType ?? 'code'
  )
  const [content, setContent] = useState(submission?.content ?? '')
  const [loading, setLoading] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (submission) {
      setContentType(submission.contentType)
      setContent(submission.content)
    }
  }, [submission])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setReviewError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/skill/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          content: content.trim(),
          contentType,
        }),
      })

      const data = (await res.json()) as {
        error?: string
        message?: string
        details?: { retryable?: boolean }
      }
      if (!res.ok) {
        const errorMsg =
          data.message ?? data.error ?? 'エラーが発生しました'
        setError(errorMsg)
        return
      }

      setSuccess(true)
      setTimeout(() => router.refresh(), 500)
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('ネットワークエラー: インターネット接続を確認してください')
      } else {
        setError(toUserFriendlyError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateReview() {
    if (!submission) return
    setReviewError(null)
    setReviewLoading(true)

    try {
      const res = await fetch('/api/skill/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          skillType: goal.skillType,
          goalText: goal.goalText,
          stepTitle: step.title,
          stepTask: step.task,
          deliverable: step.deliverable,
          submission: submission.content,
        }),
      })

      const data = (await res.json()) as {
        error?: string
        message?: string
        details?: { retryable?: boolean }
      }
      if (!res.ok) {
        const errorMsg =
          data.message ??
          data.error ??
          'レビュー生成に失敗しました。再試行してください。'
        if (data.error === 'AIServiceError' && data.details?.retryable) {
          setReviewError(`${errorMsg} しばらく待ってから再試行してください。`)
        } else {
          setReviewError(errorMsg)
        }
        return
      }

      router.refresh()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setReviewError('ネットワークエラー: インターネット接続を確認してください')
      } else {
        setReviewError(toUserFriendlyError(err))
      }
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div>
          <label style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span>
              <input
                type="radio"
                name="contentType"
                value="code"
                checked={contentType === 'code'}
                onChange={() => setContentType('code')}
                disabled={loading}
              />
              <span style={{ marginLeft: 4 }}>コード</span>
            </span>
            <span>
              <input
                type="radio"
                name="contentType"
                value="url"
                checked={contentType === 'url'}
                onChange={() => setContentType('url')}
                disabled={loading}
              />
              <span style={{ marginLeft: 4 }}>URL</span>
            </span>
          </label>
        </div>

        {contentType === 'code' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={12}
            placeholder="コードを貼り付けてください"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              fontFamily: 'monospace',
              border: '1px solid #ccc',
              borderRadius: 6,
              resize: 'vertical',
            }}
          />
        ) : (
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            placeholder="https://github.com/user/repo または https://example.com"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 16,
              border: '1px solid #ccc',
              borderRadius: 6,
            }}
          />
        )}

        {error && (
          <p role="alert" style={{ color: '#c00', fontSize: 14 }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: '#22c55e', fontSize: 14 }}>
            ✓ 提出物を保存しました
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            fontWeight: 600,
            border: 'none',
            borderRadius: 6,
            background: loading ? '#999' : '#2563eb',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {loading ? '保存中…' : submission ? '更新' : '保存'}
        </button>
      </form>

      {submission && (
        <div>
          <button
            type="button"
            onClick={handleGenerateReview}
            disabled={reviewLoading}
            style={{
              padding: '10px 20px',
              fontSize: 16,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              background: reviewLoading ? '#999' : '#7c3aed',
              color: '#fff',
              cursor: reviewLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {reviewLoading ? 'レビュー生成中…' : 'AI レビューを生成'}
          </button>
          {reviewError && (
            <p
              role="alert"
              style={{ color: '#c00', fontSize: 14, marginTop: 8 }}
            >
              {reviewError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
