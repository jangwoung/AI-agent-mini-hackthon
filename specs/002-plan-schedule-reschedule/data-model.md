# Data Model: 計画の日程表示・自動リスケジュール

**Feature**: 002-plan-schedule-reschedule  
**Date**: 2025-01-25  
**Storage**: Firebase Firestore（001 の既存コレクションを拡張）

## 概要

001 の `skillGoals`・`skillSteps` を拡張する。新規コレクションは MVP では設けない。`rescheduleEvents` は将来用にスキーマのみ定義する。

## エンティティ関係（002 追加分）

```
SkillGoal (1) ──< (many) SkillStep
  │                    │
  │                    ├── scheduledDate, status, estimatedMinutes（002 で追加）
  │                    └── done（001 既存。status === 'done' と同期）
  │
  └── deadline | startDate + duration（002 で追加、任意）
```

## 既存エンティティの拡張

### 1. SkillGoal（拡張）

**Collection**: `skillGoals`（001 既存）

**002 で追加するフィールド**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `deadline` | string | No | 資格モード用。期限日 YYYY-MM-DD | ISO date |
| `startDate` | string | No | Skill モード用。開始日 YYYY-MM-DD | ISO date |
| `duration` | number | No | Skill モード用。学習期間（日数） | 正の整数 |

- `deadline` のみ設定: 期限モード。超過日には配置しない／アラート
- `startDate` と `duration` を設定: 期間モード。`startDate + duration` を超過しない／アラート
- 両方未設定: 制限なし（MVP の多くはこちら）

**Example（拡張後）**:
```json
{
  "id": "goal_abc123",
  "skillType": "nextjs",
  "goalText": "Create a CRUD app with Next.js",
  "createdAt": "2025-01-25T10:00:00Z",
  "userId": null,
  "deadline": "2025-02-28",
  "startDate": "2025-01-25",
  "duration": 14
}
```

---

### 2. SkillStep（拡張）

**Collection**: `skillSteps`（001 既存）

**002 で追加するフィールド**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `scheduledDate` | string | No | 予定日 YYYY-MM-DD | ISO date |
| `status` | string | No | 予定・実施済み・未達・スキップ | 下記 enum |
| `estimatedMinutes` | number | No | 所要時間（分） | 1..480 |

**`status` のとりうる値**:
- `scheduled`: 予定（デフォルト）
- `done`: 実施済み（`done === true` と同期）
- `missed`: 未達（予定日を過ぎたが未実施）
- `skipped`: ユーザーが「今日はできない」でスキップ

**同期ルール**:
- `status === 'done'` → `done === true`
- `status !== 'done'` → `done === false`
- 既存の `done` 更新は、`status` 未送信時は従来どおり。送信時は `status` を優先し `done` を同期する。

**Example（拡張後）**:
```json
{
  "id": "step_xyz789",
  "goalId": "goal_abc123",
  "index": 1,
  "title": "Set up Next.js project",
  "task": "Create a new Next.js project...",
  "deliverable": "A working Next.js project...",
  "done": false,
  "createdAt": "2025-01-25T10:00:05Z",
  "scheduledDate": "2025-01-25",
  "status": "scheduled",
  "estimatedMinutes": 30
}
```

**Indexes**:
- 001 既存: `skillSteps` の `goalId`（＋複合で `index`）
- 002 追加: `scheduledDate` による検索が必要な場合、複合 `(goalId, scheduledDate)` を検討。MVP では「goal の全 step 取得してメモリ上で日付フィルタ」でも可。

**State Transitions**:
- `scheduled` → `done`（ユーザーが完了）
- `scheduled` → `skipped`（ユーザーが Skip）
- `scheduled` → `missed`（予定日経過で自動判定。表示上は `missed`、繰り越し後は `scheduled` ＋ 新しい `scheduledDate`）
- リスケジュール時: `scheduledDate` の更新のみ。`status` は `scheduled` のまま

---

### 3. RescheduleEvent（将来用・MVP では未実装）

**Collection**: `rescheduleEvents`（任意）

| Field | Type | Description |
|-------|------|-------------|
| `goalId` | string | 対象 Goal |
| `fromDate` | string | 移動元日付 YYYY-MM-DD |
| `toDate` | string | 移動先日付 YYYY-MM-DD |
| `movedTaskIds` | string[] | 移動した Step ID 一覧 |
| `reason` | string | `missed` \| `skipped` \| `manual` |
| `createdAt` | timestamp | 作成日時 |

---

## API レスポンス型（Schedule）

Firestore には保存しない。`GET /api/skill/[goalId]/schedule` のレスポンス構造。

### ScheduleResponse

```typescript
interface ScheduleResponse {
  goalId: string
  days: DayItem[]
  alerts: string[]
}

interface DayItem {
  date: string       // YYYY-MM-DD
  tasks: TaskItem[]
}

interface TaskItem {
  stepId: string
  goalId: string
  index: number
  title: string
  status: 'scheduled' | 'done' | 'missed' | 'skipped'
  scheduledDate: string
  estimatedMinutes?: number
  done: boolean
}
```

- `alerts`: 期限／期間超過の警告メッセージ。複数可。

---

## Validation（Zod）拡張

### 新規スキーマ

```typescript
export const StepStatusSchema = z.enum(['scheduled', 'done', 'missed', 'skipped'])

export const DateYYYYMMDDSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const ScheduleParamsSchema = z.object({
  goalId: z.string().min(1),
})

// PATCH /api/skill/step/[stepId] 拡張リクエスト
export const StepUpdateRequestSchema = z.object({
  done: z.boolean().optional(),
  status: StepStatusSchema.optional(),
  scheduledDate: DateYYYYMMDDSchema.optional(),
}).refine(
  (d) => d.done !== undefined || d.status !== undefined || d.scheduledDate !== undefined,
  { message: 'At least one of done, status, scheduledDate required' }
)
```

- 既存 `StepCompletionRequestSchema` は `done` のみ。002 では `StepUpdateRequestSchema` に統合するか、PATCH ハンドラで両方を受け付ける。

### SkillGoal 拡張（アプリ層）

- `deadline` / `startDate` / `duration` は optional。作成時・更新時に Zod で検証する。

---

## Firestore Security Rules

001 の MVP ルールをそのまま利用。002 で追加するフィールドはすべて同一コレクション内の追加のため、ルール変更は不要。本番用ルールも 001 の `userId` ベースのまま拡張なしでよい。

---

## Data Access Patterns

### 新規・拡張クエリ

1. **計画用に Goal の全 Step 取得**:
   ```typescript
   db.collection('skillSteps')
     .where('goalId', '==', goalId)
     .orderBy('index', 'asc')
   ```

2. **未割当 Step の取得**: 上記と同じ。`scheduledDate` が未設定のものをアプリでフィルタ。

3. **今日〜N 日分のタスク**: 上記取得後、`scheduledDate` でメモリ上フィルタ。必要なら複合インデックス `(goalId, scheduledDate)` を追加。

### 更新パターン

1. **初期配置**: 未割当 Step の `scheduledDate` をバッチ更新。
2. **Skip**: 該当 Step の `status = 'skipped'` に更新。
3. **リスケジュール**: 対象 Step の `scheduledDate` を新しい日付に更新。`status` は `scheduled` のまま。
4. **完了**: `done = true` かつ `status = 'done'` に更新。

---

## TypeScript 型（002 追加分）

```typescript
// lib/plan/types.ts または lib/firebase/types.ts に追加

export type StepStatus = 'scheduled' | 'done' | 'missed' | 'skipped'

export interface SkillGoalScheduleFields {
  deadline?: string      // YYYY-MM-DD
  startDate?: string     // YYYY-MM-DD
  duration?: number      // days
}

export interface SkillStepScheduleFields {
  scheduledDate?: string   // YYYY-MM-DD
  status?: StepStatus
  estimatedMinutes?: number
}

// SkillGoal = 001 の SkillGoal + SkillGoalScheduleFields
// SkillStep = 001 の SkillStep + SkillStepScheduleFields
```

既存 `SkillGoal` / `SkillStep` を拡張するか、別 interface で `&` するかは実装時に選択。
