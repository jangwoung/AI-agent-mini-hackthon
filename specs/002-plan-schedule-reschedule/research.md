# Research: 計画の日程表示・自動リスケジュール

**Feature**: 002-plan-schedule-reschedule  
**Date**: 2025-01-25  
**Purpose**: 技術的不確実性の解消と、Schedule View / Auto Reschedule の実装方針確立

## Technology Decisions

### 1. タスク＝SkillStep の拡張

**Decision**: 新規 Task エンティティは作らず、既存 `skillSteps` に `scheduledDate`・`status`・`estimatedMinutes`（任意）を追加する。

**Rationale**:
- 001 の Step がすでに「学習単位」として存在し、計画の最小単位と一致する
- 別コレクションにすると Goal–Step–Schedule の整合性が複雑になる
- 既存 Step の CRUD・UI を活かしつつ拡張する方が変更が少ない

**Alternatives considered**:
- 別 `scheduledTasks` コレクション: Step と 1:1 で同期が必要になり負荷大
- Task を Step の子ドキュメント: Firestore の制約上、クエリ・更新が煩雑

**Implementation notes**:
- `done` は維持。`status === 'done'` のとき `done === true` に同期する
- 既存 Step に `scheduledDate` 未設定のものは、計画画面初回アクセス時に「初期配置」で割り当てる

---

### 2. 自動リスケジュールのトリガー

**Decision**: バッチ（cron）は MVP では行わず、**オンラインで**次の 2 タイミングのみ実行する。(1) **計画データ取得時**（GET `/api/skill/[goalId]/schedule`）、(2) **Skip 操作時**（PATCH ` step` で `status: 'skipped'` を付与した直後）。

**Rationale**:
- 実装が単純で、ユーザーが「今見ている計画」と常に一致する
- サーバーレス cron の設定・監視が不要
- 未達の検出は「`scheduledDate < today` かつ `status === 'scheduled'`」でその場判定できる

**Alternatives considered**:
- 日次 cron: 実装・運用コストが増える。MVP では過剰
- クライアントのみで再配置: 他端末・再読込時との一貫性が保てない

**Implementation notes**:
- `GET schedule` ハンドラ内で `ensureSchedule` → `runReschedule` → `buildScheduleResponse` の順で実行
- Skip 時は `PATCH` で `status: 'skipped'` を保存後、同一 goal に対して `runReschedule` を 1 回だけ呼ぶ

---

### 3. 「今日」の判定・タイムゾーン

**Decision**: MVP では **サーバー日付** を用いる。Node の `Date` は `TZ` 未設定時はサーバー環境のローカル時間。本番は Vercel など UTC 前提が多いため、**環境変数 `TZ`（例: `Asia/Tokyo`）** を推奨し、`today` を `YYYY-MM-DD` で統一する。

**Rationale**:
- ユーザー別タイムゾーンは DB 設計・UI が複雑になる。MVP では見送り
- `TZ` で一貫した「日」の切り替えができれば、未達判定は明確

**Alternatives considered**:
- ユーザー設定タイムゾーン: 将来拡張。MVP では未対応
- 常に UTC: 日本ユーザーでは「日」の感覚がずれるため不採用

**Implementation notes**:
- `lib/plan/dates.ts` 等で `getTodayYYYYMMDD()` を用意し、すべての日付比較で利用
- Edge Cases（仕様）に記載の「日の切り替え時刻」は v0.2 で検討

---

### 4. 1 日あたりの上限（Daily Cap）

**Decision**: 上限は **タスク数** で制御する。MVP のデフォルトは **1 日最大 2 タスク**。分数（`estimatedMinutes`）は任意項目のため、初期版では「タスク数」のみで制御する。

**Rationale**:
- prd-mvp-add は「2 タスク or 60 分」の二者択一。実装単純さからタスク数に統一
- `estimatedMinutes` が未設定の Step が多い場合、分数ベースだと上限が効きにくい

**Alternatives considered**:
- 60 分上限: 全 Step に `estimatedMinutes` が必要。001 では未使用のため MVP では見送り
- 設定可能: 将来、goal 単位やユーザー設定で変更可能にする余地は残す

**Implementation notes**:
- `MAX_TASKS_PER_DAY = 2` を定数または env で持つ
- 空き探索時は「その日の `scheduledDate` 一致タスク数 < 上限」で判定

---

### 5. 初期配置ルール（未割当 Step への `scheduledDate` 付与）

**Decision**: 計画取得時、`scheduledDate` が未設定の Step がある場合、**`index` 昇順**で「今日から順に、日ごとの上限を守りながら」割り当てる。既に割り当て済みの Step は変更しない。

**Rationale**:
- 順序を守りつつ、負荷を均等にしたい
- 既存の `index` を信頼し、余計な優先度ロジックを増やさない

**Implementation notes**:
- `ensureSchedule(goalId)`: 未割当 Step を取得 → 今日以降で空き日を探す → バッチ更新
- 初期配置と「未達・スキップの繰り越し」は別処理。繰り越しは優先順位（期限近い > 弱点復習 > 通常）を適用するが、MVP では「通常タスクのみ」とし、優先度は同一として扱う（v0.2 で細分化可能）

---

### 6. 期限・期間超過とアラート（資格 / Skill モード）

**Decision**: `skillGoals` に **任意**で `deadline`（資格モード）または `startDate`＋`duration`（Skill モード）を持たせる。リスケジュール結果、**期限 / 期間を超える日にタスクが配置されそうになった場合**に、`GET schedule` のレスポンスに `alerts: string[]` を追加する。MVP では**警告表示のみ**で、配置のブロックはしない。

**Rationale**:
- 仕様どおり「超過時はアラート」。実装は軽量
- 資格 / Skill の厳密なモード分けは将来対応。MVP では `deadline` があれば期限モード、`startDate`＋`duration` があれば期間モードとみなす

**Alternatives considered**:
- 超過したタスクを配置しない: 仕様で「ブロック必須」ではないため、まずはアラートに限定
- クライアントのみでアラート: 真正性を保つにはサーバー計算が望ましい

**Implementation notes**:
- `buildScheduleResponse` 内で、配置後の日付一覧と `deadline` / `startDate + duration` を比較し、超過ありなら `alerts` にメッセージを追加
- UI は `alerts` をそのまま表示（例: 計画画面上部のバナー）

---

### 7. リスケジュール履歴（rescheduleEvents）

**Decision**: MVP では **実装しない**。必要になったら `rescheduleEvents` コレクションを追加する。

**Rationale**:
- 仕様で「任意」とされている
- 動作検証・アラート・繰り越しロジックの実装を優先する

**Implementation notes**:
- data-model に「将来用」のスキーマのみ記載。実装は Phase 2 以降

---

### 8. API 設計の整理

**Decision**:
- **GET `/api/skill/[goalId]/schedule`**: 計画データ取得。内部で `ensureSchedule` → `runReschedule` を実行したうえで、今日〜14 日分の `days` と `alerts` を返す
- **PATCH `/api/skill/step/[stepId]`**: 既存の `done` に加え、`status`（`scheduled`|`done`|`missed`|`skipped`）と `scheduledDate` の更新を許可。`status: 'skipped'` 時は当該 goal に対して `runReschedule` を 1 回実行
- リスケジュール専用の **POST** は設けない。上記 2 経路で完結する

**Rationale**:
- 計画は「取得時に常に最新」にし、フロントは単純に GET するだけにする
- Step 更新は既存 PATCH の拡張で済み、エンドポイント増加を防ぐ

---

### 9. 既存 001 との相互作用

**Decision**: 
- `done` は維持。`status` 更新時、`status === 'done'` なら `done = true`、それ以外なら `done = false` に同期する（既存 Step 一覧・完了チェックの挙動を保持）
- 001 の `PATCH /api/skill/step/[stepId]` は `done` のみ受付。002 では `status` / `scheduledDate` も受け付け、後方互換を保つ
- Firestore の `skillSteps` スキーマ拡張は ** additive only**。既存ドキュメントに `scheduledDate` がなくても動作する

**Rationale**:
- 001 単体の利用を壊さない
- 002 未対応クライアントは従来どおり `done` のみ送ればよい

---

### 10. UI 配置・導線

**Decision**:
- **計画画面**: `/plan`（クエリ `?goalId=...` で goal 指定）または `/skill/[goalId]/plan` のいずれか、あるいは両方提供。MVP では **`/skill/[goalId]/plan`** を優先し、goal コンテキストを明確にする
- **Home（今日）**: 001 の `/` を拡張し、今日のタスク一覧と「未達 N 件」バッジを表示。goal 未選択時は「直近の goal」や一覧からの選択に寄せる（簡易実装でよい）
- **Step 詳細**: `scheduledDate` 表示と **Skip ボタン**（任意だが推奨）を追加

**Rationale**:
- prd-mvp-add の新規画面・既存拡張方針に沿う
- `/skill/[goalId]/plan` にすると、既存 Step 一覧からの導線が作りやすい

---

## Implementation Phases (High-Level)

### Phase 1: データモデル・API
- `skillSteps` に `scheduledDate`・`status`・`estimatedMinutes` 追加。Zod スキーマ拡張
- `skillGoals` に `deadline` / `startDate` / `duration`（任意）追加
- `GET /api/skill/[goalId]/schedule` 実装。`ensureSchedule`・`runReschedule`・`buildScheduleResponse` のスタブでも可
- `PATCH /api/skill/step/[stepId]` 拡張（`status`・`scheduledDate`）。Skip 時に reschedule 呼び出し

### Phase 2: 計画 UI
- `/skill/[goalId]/plan` ページ。`ScheduleView`（14 日縦リスト）・`DayRow`・`TaskItem`
- 計画画面から Step 詳細へのリンク。Step 詳細に `scheduledDate`・Skip 表示

### Phase 3: Home・アラート
- Home に「今日のタスク」「未達 N 件」を表示
- `alerts` を計画画面で表示

### Phase 4: テスト・ポリッシュ
- リスケジュール・日付計算のユニットテスト。Schedule API の結合テスト。E2E で計画表示・Skip・繰り越し確認

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 既存 Step への拡張で 001 が壊れる | 高 | 追加フィールドのみ。`done` と `status` の同期をテストで保証 |
| リスケジュールの競合（同時更新） | 中 | 1 goal 単位で実行。必要なら Firestore トランザクションで Step 更新をまとめる |
| 14 日全て上限到達で配置不可 | 中 | 仕様 Edge Case。まずは「配置できた分だけ返す＋アラート」とし、v0.2 で「翌週へ」等を検討 |
| タイムゾーンずれ | 低 | `TZ` で統一。明示的にドキュメント化 |

---

## Open Questions Resolved

- ✅ タスク単位: SkillStep 拡張で対応
- ✅ リスケジュールトリガー: 計画取得時と Skip 時のオンライン実行
- ✅ 今日の判定: サーバー日付、`TZ` 推奨
- ✅ 1 日上限: タスク数 2。分数は将来対応
- ✅ 初期配置: `index` 順・今日から・上限遵守
- ✅ 期限 / 期間アラート: 超過時 `alerts` 追加、ブロックはしない
- ✅ `rescheduleEvents`: MVP では未実装

---

## Next Steps

1. Phase 1: data-model.md 反映、contracts（`api-skill-schedule.yaml` 等）作成、quickstart 更新
2. `/speckit.tasks` でタスク分解
3. 実装は TDD で進める（reschedule・ensureSchedule・日付ユーティリティから）
