import { DayRow } from './DayRow'
import type { ScheduleResponse } from '@/lib/plan/types'

type ScheduleViewProps = {
  schedule: ScheduleResponse
  goalId: string
}

export function ScheduleView({ schedule, goalId }: ScheduleViewProps) {
  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        計画（今日から14日）
      </h1>
      {schedule.alerts.length > 0 && (
        <div
          role="alert"
          style={{
            padding: 12,
            marginBottom: 16,
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 6,
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {schedule.alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {schedule.days.map((day) => (
          <DayRow key={day.date} day={day} goalId={goalId} />
        ))}
      </div>
    </>
  )
}
