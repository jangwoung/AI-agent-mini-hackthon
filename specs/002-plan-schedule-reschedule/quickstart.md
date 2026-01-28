# Quickstart Guide: 計画の日程表示・自動リスケジュール

**Feature**: 002-plan-schedule-reschedule  
**Date**: 2025-01-25  
**Purpose**: 002 機能をローカルで動かすための最短手順。001 のセットアップが済んでいる前提。

## Prerequisites

- 001 の Quickstart が完了していること（Next.js, Firebase, Firestore, 環境変数）
- Node.js 20.x+, npm
- （任意）`TZ=Asia/Tokyo` で「今日」を日本時間に合わせる

## 001 との差分

- **追加依存**: なし（001 と同じ）
- **追加 env**: なし。`TZ` は任意（未設定時はサーバーローカル日付）
- **Firestore**: 既存 `skillGoals` / `skillSteps` にフィールド追加のみ。新規コレクションは MVP ではなし

## Step 1: 実装の確認

002 の実装後、以下が存在することを確認する:

```bash
# 計画 API
app/api/skill/[goalId]/schedule/route.ts

# 計画 UI
app/(routes)/skill/[goalId]/plan/page.tsx
app/components/plan/ScheduleView.tsx
app/components/plan/DayRow.tsx
app/components/plan/TaskItem.tsx

# ロジック
lib/plan/reschedule.ts
lib/plan/ensure-schedule.ts
lib/plan/types.ts
```

- `PATCH /api/skill/step/[stepId]` は 001 既存を拡張（`status`, `scheduledDate` 対応）

## Step 2: 開発サーバー起動

```bash
npm run dev
# または
yarn dev
```

`http://localhost:3000` を開く。

## Step 3: 002 の動作確認

### 3.1 計画画面（Schedule View）

1. 001 で Goal 作成済みなら `/skill/[goalId]` を開く
2. 「計画を見る」などから **`/skill/[goalId]/plan`** に遷移
3. **今日から 14 日分**の日付が縦リストで表示される
4. 各日に紐づく **タスク一覧**と **ステータス**（予定 / 実施済み / 未達 / スキップ）が表示される
5. まだ `scheduledDate` が付いていない Step があれば、初回表示時に **初期配置** され、日付が割り当てられる

### 3.2 自動リスケジュール（未達の繰り越し）

1. ある Step の `scheduledDate` を **過去の日**にしておく（Firestore で直接編集するか、将来的に「日付変更」UI で）
2. その Step の `status` は `scheduled` のまま
3. **`/skill/[goalId]/plan`** を再表示（GET schedule が走る）
4. 当該タスクが **今日以降の空いている日**に繰り越されて表示される
5. 1 日あたりの上限（デフォルト 2 タスク）を超えないこと

### 3.3 Skip → 繰り越し

1. Step 詳細（`/skill/[goalId]/steps/[stepId]`）を開く
2. **Skip** ボタンを押す（`PATCH` で `status: skipped`）
3. 計画画面に戻る
4. スキップしたタスクが **次の空き日**に繰り越されている

### 3.4 アラート（期限・期間超過）

1. Goal に `deadline` または `startDate` + `duration` を設定（Firestore で直接）
2. リスケジュールの結果、**期限 / 期間を超える日**にタスクが配置されそうになるケースを作る
3. 計画画面で **アラート**（`alerts`）が表示される

## Step 4: API の直接確認（任意）

```bash
# 計画取得（ensureSchedule + runReschedule のうえで 14 日分を返す）
curl -s "http://localhost:3000/api/skill/YOUR_GOAL_ID/schedule" | jq .

# Step をスキップ
curl -s -X PATCH "http://localhost:3000/api/skill/step/YOUR_STEP_ID" \
  -H "Content-Type: application/json" \
  -d '{"status":"skipped"}' | jq .
```

## Troubleshooting

### 計画にタスクが表示されない

- Goal に紐づく Step が存在するか確認
- `scheduledDate` が未設定の Step は、初回 GET schedule で初期配置される。仍未設定なら `ensureSchedule` ロジックを確認

### 繰り越しが動かない

- `scheduledDate < today` かつ `status === 'scheduled'` の Step があるか
- Skip の場合は `status === 'skipped'` に更新されたか
- `runReschedule` が GET schedule または Skip 時の PATCH で呼ばれているか

### 「今日」がずれる

- サーバーの `TZ`（例: `TZ=Asia/Tokyo`）を設定して再起動
- 日付は `YYYY-MM-DD` で統一されているか確認

### アラートが出ない

- Goal の `deadline` / `startDate` + `duration` が設定されているか
- 繰り越し結果が実際に期限・期間を超える配置になっているか

## Next Steps

- [data-model.md](./data-model.md): 002 のデータ構造
- [contracts/](./contracts/): `api-skill-schedule.yaml`, `api-skill-step-patch.yaml`
- [research.md](./research.md): トリガー・上限・タイムゾーン等の設計
- `/speckit.tasks` で実装タスクに落とし込む
