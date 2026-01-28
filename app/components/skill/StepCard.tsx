'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toUserFriendlyError } from '@/lib/utils/errors'
import type { SkillStep } from '@/lib/firebase/types'

type StepCardProps = { goalId: string; step: SkillStep }

export function StepCard({ goalId, step }: StepCardProps) {
  const router = useRouter()
  const [done, setDone] = useState(step.done)
  const [loading, setLoading] = useState(false)
  const href = `/skill/${goalId}/steps/${step.id}`

  async function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation()
    e.preventDefault()
    const newDone = e.target.checked
    setDone(newDone)
    setLoading(true)

    try {
      const res = await fetch(`/api/skill/step/${step.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: newDone }),
      })

      if (!res.ok) {
        setDone(!newDone)
        const data = (await res.json()) as { message?: string }
        alert(data.message ?? '更新に失敗しました')
        return
      }

      router.refresh()
    } catch (err) {
      setDone(!newDone)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        alert('ネットワークエラー: インターネット接続を確認してください')
      } else {
        alert(toUserFriendlyError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        background: done ? '#f0fdf4' : '#fff',
        color: 'inherit',
        textDecoration: 'none',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: done ? '#22c55e' : '#e5e7eb',
              color: done ? '#fff' : '#6b7280',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {done ? '✓' : step.index}
          </span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{step.title}</span>
        </span>
        <label
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: loading ? 'wait' : 'pointer',
            flexShrink: 0,
          }}
        >
          <input
            type="checkbox"
            checked={done}
            onChange={handleCheckboxChange}
            disabled={loading}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 18,
              height: 18,
              cursor: loading ? 'wait' : 'pointer',
            }}
          />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {loading ? '更新中...' : done ? '完了' : '未完了'}
          </span>
        </label>
      </div>
    </Link>
  )
}
