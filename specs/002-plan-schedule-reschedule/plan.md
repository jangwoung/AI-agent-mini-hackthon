# Implementation Plan: 計画の日程表示・自動リスケジュール

**Branch**: `002-plan-schedule-reschedule` | **Date**: 2025-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-plan-schedule-reschedule/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

既存の Skill Goal / Step（001-skill-steps）に「予定日」「ステータス」を付与し、今日から 14 日分の日付別計画ビュー（Schedule View）と、未達・スキップ時の自動繰り越し（Auto Reschedule）を提供する。技術方針: 001 と同スタック（Next.js App Router, Firestore）を継承。SkillStep に `scheduledDate`・`status` を拡張。計画画面は `/plan` または `/skill/[goalId]/plan`。リスケジュールは計画取得時・Skip 操作時にオンライン実行。1 日あたりタスク数上限で負荷を制御し、期限・期間超過時はアラート表示。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x  
**Primary Dependencies**: Next.js 14+ (App Router), Firebase Admin SDK, Zod (validation)。001 と同一。Vertex AI は本機能では未使用  
**Storage**: Firebase Firestore。既存 `skillGoals` / `skillSteps` を拡張。任意で `rescheduleEvents` コレクション  
**Testing**: Jest, React Testing Library, Playwright（001 と同様）。手動テストで Schedule View / Reschedule フロー確認  
**Target Platform**: Web（モダンブラウザ）。Vercel / Firebase デプロイ  
**Project Type**: Web application（Next.js full-stack）  
**Performance Goals**: 計画画面初回表示 < 3 秒。リスケジュール処理含めて < 5 秒  
**Constraints**: 
- MVP: 今日から 14 日分の縦リストのみ（カレンダー UI は対象外）
- 1 日あたり上限: タスク数 2 件（または 60 分）。実装時定数で指定
- 「今日」はサーバー日付（UTC または `TZ`）で判定。タイムゾーン考慮は将来拡張
**Scale/Scope**: 001 と同様。1 ユーザー × 10–100 goals。1 goal あたり 5 steps。リスケジュール対象は 1 goal 単位

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Readability & Maintainability
- ✅ Functions <50 lines, files <800 lines: 強制（コードレビュー）
- ✅ Meaningful names: 型・コンポーネント名を明確に
- ✅ Avoid deep nesting: コンポーネント・API ハンドラはフラットに

### II. Security-First
- ✅ No hardcoded secrets: 001 と同様に環境変数
- ✅ Input validation: Zod で API リクエスト検証。日付・goalId・stepId を検証
- ✅ XSS / CSRF: Next.js デフォルト対策を継承

### III. Test-First (TDD) — NON-NEGOTIABLE
- ✅ TDD: リスケジュールロジック・日付計算はテスト先行
- ✅ Coverage: 80% 以上。リスケジュール・日程表示は 100% 目標
- ✅ Unit / Integration / E2E: 日程 API・Skip・計画表示フローをカバー

### IV. Immutability & Code Quality
- ✅ Immutability: 日付・ステータス更新は明示的。イミュータブルな再配置計算
- ✅ Error handling: 検証エラー・Firestore エラーをユーザー向けメッセージに変換

### V. Development Workflow & Agent Orchestration
- ✅ Planning: 本 plan
- ✅ Code review: PR 前に必須。Constitution 準拠確認

**Gate Status**: ✅ PASS

**Post–Phase 1 (Design)**: 再評価済み。data-model・contracts・quickstart 追加後も違反なし。 Gates は維持。

## Project Structure

### Documentation (this feature)

```text
specs/002-plan-schedule-reschedule/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── api-skill-schedule.yaml
│   └── api-skill-step-patch.yaml   # 既存 PATCH 拡張
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

既存 001 構造を継承し、以下を追加・拡張:

```text
app/
├── (routes)/
│   ├── plan/
│   │   └── page.tsx                 # /plan 今日〜14日（goalId は QS またはグローバル）
│   └── skill/
│       └── [goalId]/
│           └── plan/
│               └── page.tsx         # /skill/[goalId]/plan（goal 別計画）
├── api/
│   └── skill/
│       ├── [goalId]/
│       │   └── schedule/
│       │       └── route.ts         # GET /api/skill/[goalId]/schedule
│       └── step/
│           └── [stepId]/
│               └── route.ts         # PATCH 拡張（status, scheduledDate, Skip）
├── components/
│   ├── plan/
│   │   ├── ScheduleView.tsx         # 14日縦リスト
│   │   ├── DayRow.tsx               # 1日分表示
│   │   └── TaskItem.tsx             # タスク＋ステータス・Skip）
│   └── skill/                       # 既存。Step 詳細に Skip / scheduledDate 表示追加
└── lib/
    ├── firebase/                    # 既存。skillSteps 拡張対応
    ├── plan/
    │   ├── reschedule.ts            # 自動繰り越しロジック
    │   ├── ensure-schedule.ts       # 未割当 step の初期配置
    │   └── types.ts                 # Schedule, Day, Alert 等
    └── models/
        └── schemas.ts               # 既存拡張（ScheduleRequest, StepStatus 等）
```

**Structure Decision**: 001 の Next.js App Router + `app/(routes)` 構成を維持。`/plan` と `/skill/[goalId]/plan` の両ルートをサポート。`lib/plan` に日程・リスケジュール専用ロジックを集約。

## Complexity Tracking

> 本機能では Constitution 違反の正当化はなし。未使用のため空のまま。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| （なし） | — | — |
