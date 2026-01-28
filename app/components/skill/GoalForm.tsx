'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toUserFriendlyError } from '@/lib/utils/errors'

const SKILL_OPTIONS = [
  { value: 'nextjs', label: 'Next.js' },
  { value: 'go', label: 'Go' },
  { value: 'gcp', label: 'GCP' },
] as const

export function GoalForm() {
  const router = useRouter()
  const [skillType, setSkillType] = useState<string>('nextjs')
  const [goalText, setGoalText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/skill/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillType, goalText: goalText.trim() }),
      })
      const data = (await res.json()) as {
        goalId?: string
        error?: string
        message?: string
        details?: { retryable?: boolean }
      }
      if (!res.ok) {
        const errorMsg =
          data.message ?? data.error ?? 'エラーが発生しました'
        if (data.error === 'AIServiceError' && data.details?.retryable) {
          setError(`${errorMsg} しばらく待ってから再試行してください。`)
        } else {
          setError(errorMsg)
        }
        return
      }
      if (data.goalId) {
        router.push(`/skill/${data.goalId}`)
        return
      }
      setError('レスポンスが不正です')
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label>
        <span style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>技術</span>
        <select
          value={skillType}
          onChange={(e) => setSkillType(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 16,
            border: '1px solid #ccc',
            borderRadius: 6,
          }}
        >
          {SKILL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>目標（10〜500文字）</span>
        <textarea
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          disabled={loading}
          rows={4}
          minLength={10}
          maxLength={500}
          placeholder="例: Next.jsでCRUDアプリを作る"
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 16,
            border: '1px solid #ccc',
            borderRadius: 6,
            resize: 'vertical',
          }}
        />
      </label>
      {error && (
        <p role="alert" style={{ color: '#c00', fontSize: 14 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || goalText.trim().length < 10}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          fontWeight: 600,
          border: 'none',
          borderRadius: 6,
          background: loading ? '#999' : '#2563eb',
          color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '生成中…' : '5ステップを生成'}
      </button>
    </form>
  )
}
