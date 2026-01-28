import { TaskItem } from './TaskItem'
import type { DayItem } from '@/lib/plan/types'

type DayRowProps = {
  day: DayItem
  goalId: string
}

export function DayRow({ day, goalId }: DayRowProps) {
  return (
    <section
      style={{
        marginBottom: 24,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        {day.date}
      </h3>
      {day.tasks.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>タスクなし</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {day.tasks.map((task) => (
            <li key={task.stepId}>
              <TaskItem task={task} goalId={goalId} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
