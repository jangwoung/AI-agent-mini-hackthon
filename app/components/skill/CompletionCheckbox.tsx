'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toUserFriendlyError } from '@/lib/utils/errors'

type CompletionCheckboxProps = {
  stepId: string
  done: boolean
}

export function CompletionCheckbox({ stepId, done: initialDone }: CompletionCheckboxProps) {
  const router = useRouter()
  const [done, setDone] = useState(initialDone)
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDone = e.target.checked
    setDone(newDone)
    setLoading(true)

    try {
      const res = await fetch(`/api/skill/step/${stepId}`, {
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
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: loading ? 'wait' : 'pointer' }}>
      <input
        type="checkbox"
        checked={done}
        onChange={handleChange}
        disabled={loading}
        style={{ width: 18, height: 18, cursor: loading ? 'wait' : 'pointer' }}
      />
      <span style={{ fontSize: 14, color: '#374151' }}>
        {done ? '完了済み' : '未完了'}
      </span>
    </label>
  )
}
