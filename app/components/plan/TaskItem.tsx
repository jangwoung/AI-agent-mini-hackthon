import Link from 'next/link'
import type { TaskItem as TaskItemType } from '@/lib/plan/types'

const STATUS_LABELS: Record<TaskItemType['status'], string> = {
  scheduled: '予定',
  done: '実施済み',
  missed: '未達',
  skipped: 'スキップ',
}

type TaskItemProps = {
  task: TaskItemType
  goalId: string
}

export function TaskItem({ task, goalId }: TaskItemProps) {
  return (
    <div
      style={{
        padding: '8px 12px',
        border: '1px solid #eee',
        borderRadius: 6,
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          marginRight: 8,
          color: '#666',
        }}
      >
        {STATUS_LABELS[task.status]}
      </span>
      <Link href={`/skill/${goalId}/steps/${task.stepId}`}>
        {task.index}. {task.title}
      </Link>
    </div>
  )
}
