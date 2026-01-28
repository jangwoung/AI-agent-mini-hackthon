import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Skill Tutor (MVP)
      </h1>
      <p style={{ marginBottom: 24 }}>学習目標を作成し、5ステップのロードマップを生成します。</p>
      <p>
        <Link
          href="/skill/new"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          学習目標を作成 →
        </Link>
      </p>
    </main>
  )
}
