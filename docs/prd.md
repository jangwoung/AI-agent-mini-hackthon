# 要件定義 Skill Tutor

## 0. メタ情報（YAML追記）

```yaml
feature_addition:
  name: Skill Tutor（技術習得チューター）
  version: v0.1-mvp
  target_skills:
    - Next.js
    - Go
    - GCP
  concept:
    - プロジェクトベース学習（概念→例→演習→RV）
    - 目標・経験・時間に応じてステップをパーソナル生成
    - 提出物に対しAIがレビュー（RV）して次ステップに反映
kpi_addition:
  - D7継続率（Skillモード）
  - Step完了率（ステップ消化率）
  - RV提出率（レビューに出す割合）
  - 成果物完成率（プロジェクト完了）
```

## 1. 背景・課題（追記）

* 技術習得（Next.js / Go / GCP）は「教材完走」では成果になりにくい
* つまずきポイントが人によって違い、復習/矯正がないと伸びない
* “作りながら学ぶ” 形式が最短だが、道筋とレビューが不足しがち

## 2. ゴール（追記）

* ユーザーが **「作れる状態」** になるまで、AIが学習ルートを設計し、提出物をレビューしながら伴走する
* 学習ログを成果（README/ブログ/ポートフォリオ）へ変換できる下地を作る

## 3. ユースケース（追記）

* 技術目標を作成（例：Next.jsで認証付きCRUDを作れる）
* AIが “プロジェクト学習ステップ” を生成（概念→演習→提出）
* ユーザーが提出（URL/GitHub/コード貼り付け）
* AIがRV（良い点/改善点/次の1手）を返す
* RV結果をもとに次ステップが更新される（難易度/補助）

## 4. スコープ

### 4.1 MVP（Skill Tutor v0.1）

* Skill Goal作成（技術/期間/可処分時間/経験）
* Project Template選択（少数でOK）
* AIによるステップ生成（最大5〜10ステップ）
* 提出（URL / GitHub / コード貼り付け いずれか）
* AIレビュー（RV）生成
* Stepの完了管理・進捗表示

### 4.2 MVPでやらない

* 自動実行（lint/test）連携
* IDE統合、MCPサーバー連携
* コミュニティレビュー
* Rubric採点の厳密化（点数付け）
* 成果物自動生成（ブログ/README）は後

## 5. 機能要件

### 5.1 Skill Goal

* 入力
  * skill_type（Next.js / Go / GCP）
  * goal_text（自由入力）
  * duration（例：2週間）
  * weekly_time_budget（例：平日30分/休日2時間）
  * level（初学/経験あり）
* 出力：goal_id

### 5.2 Project Template

* 例（MVPは各スキル1本でも可）

  * Next.js：認証付きミニCRUD（例：Todo/Notes）
  * Go：REST API（CRUD + Validation）
  * GCP：Cloud Run + Firestore で簡易API

### 5.3 Step生成（AI）

* 生成単位：Step[ ]（順序あり）
* Stepの構造（最低限）

  * title（何をやるか）
  * objective（できるようになること）
  * task（具体手順）
  * deliverable（提出物）
  * hints（詰まった時のヒント）

### 5.4 RV（レビュー）

* 入力：提出物（URL or repo or code text）+ Step文脈
* 出力（固定フォーマット）

  * Keep（良い点）
  * Problem（改善点）
  * Try（次に直す具体案）
  * Next（次のステップ）

## 6. 画面要件（追記）

* Skill Goal作成
* Project選択
* Step一覧（現在のStepが目立つ）
* Step詳細（タスク/提出欄/レビュー結果）
* 進捗（完了数/残り）

## 7. データ要件（追記・最小）

* SkillGoal
* SkillStep
* Submission
* Review

---
