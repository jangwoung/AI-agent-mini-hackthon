import Link from 'next/link'
import { GoalForm } from '@/app/components/skill/GoalForm'

export default function SkillNewPage() {
  return (
    <main>
      <p style={{ marginBottom: 16 }}>
        <Link href="/">← トップ</Link>
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        学習目標を作成
      </h1>
      <GoalForm />
    </main>
  )
}
