
# 3時間で実装できるMVP版（超削った仕様）

「3時間で動く」を最優先に、**DB設計もUIも最小**に落とします。
※ ここでは “AI連携” は **1エンドポイント（generate）+ 1エンドポイント（review）** に集約。

---

## A. MVPが提供する体験（これだけ）

1. **技術を選ぶ**（Next.js / Go / GCP）
2. **目標を一言で書く**（例：Next.jsでCRUDアプリ作る）
3. **AIが5ステップ生成**（Step1〜5）
4. **Stepを開いて提出**（コード貼り付け or URL）
5. **AIがレビュー**（Keep/Problem/Try/Next）
6. **Step完了チェック**

これ以上は削る（ログ分析・復習最適化・通知などは全部後）

---

## B. 画面（最小4画面）

1. `/skill/new`：Skill Goal作成（select + textarea + button）
2. `/skill/:goalId`：Step一覧（5個のカード + 完了チェック）
3. `/skill/:goalId/steps/:stepId`：Step詳細（task表示 + 提出欄 + Review表示）
4. `/skill/:goalId/steps/:stepId/review`：レビュー実行（ボタン1つでも可）

---

## C. データ（ローカルでもOKな最小スキーマ）

DBに時間かけないため、**最初はSQLite/Prisma**か、もっと削って**firebase**でも成立。

### 推奨（3時間なら localStorage が最速）

```ts
type SkillGoal = {
  id: string
  skillType: "nextjs" | "go" | "gcp"
  goalText: string
  createdAt: string
}

type SkillStep = {
  id: string
  goalId: string
  index: number
  title: string
  task: string
  deliverable: string
  done: boolean
}

type Submission = {
  stepId: string
  content: string // URL or code
  createdAt: string
}

type Review = {
  stepId: string
  keep: string
  problem: string
  try: string
  next: string
  createdAt: string
}
```

---

## D. API（2本だけ）

### 1) ステップ生成

* `POST /api/skill/generate`
* body: `{ skillType, goalText }`
* returns: `SkillStep[]`（5個固定）

### 2) レビュー生成

* `POST /api/skill/review`
* body: `{ skillType, goalText, stepTitle, stepTask, deliverable, submission }`
* returns: `{ keep, problem, try, next }`

---

## E. AIプロンプト（最小・コピペ用の形）

### generate用（5ステップ固定がポイント）

* 目的：出力形式を必ず揃えてUI実装を簡単にする

#### System

* あなたは技術メンター。初心者でも進められるように、ステップを具体化する。

#### User

* 技術: {skillType}
* 目標: {goalText}
* 制約: ステップは5つ、順序あり、各ステップは title/task/deliverable を含む
* 出力はJSON配列のみ

### review用

#### User

* 技術: {skillType}
* 目標: {goalText}
* 今のステップ: {stepTitle}
* タスク: {stepTask}
* 成果物条件: {deliverable}
* 提出物: {submission}
* Keep/Problem/Try/Next の4項目で、日本語で具体的に。
* 出力はJSONのみ

---

## F. 3時間実装の「作業順」

**最短ルート**（Next.js App Router想定）

1. 画面の箱だけ作る（4ページ）
2. localStorageでGoal/Stepsを保存できるようにする
3. `/api/skill/generate` 作って、AIからStep配列を返す
4. Step詳細に提出欄を置く（textarea）
5. `/api/skill/review` 作って、レビューを返す
6. Reviewを表示して「done」チェック

---

## G. MVPの受け入れ基準（これだけ満たせばOK）

* 目標を入力→5ステップ生成→一覧に表示される
* Step詳細で提出できる
* 提出→AIレビューが返って表示される
* Step完了チェックが保存され、一覧に反映される
