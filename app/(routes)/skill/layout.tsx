export default function SkillLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      {children}
    </div>
  )
}
