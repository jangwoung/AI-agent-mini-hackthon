# 手動確認手順（詳細）

MVP の手動確認に必要な、Firebase・Vertex AI の設定からローカル起動・動作確認までを step-by-step でまとめます。

---

## 前提

- Node.js 20.x 以上
- Google アカウント（Firebase / Google Cloud 共通）
- ターミナルで `npm` が使えること

---

## 1. Firebase で行うこと

### 1.1 プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. **「プロジェクトを追加」** をクリック
3. プロジェクト名を入力（例: `ai-agent-mini`）→ **続行**
4. Google アナリティクスは **オプション**（有効でも無効でも可）→ **プロジェクトを作成**
5. 作成完了後、**プロジェクト ID** をメモ（例: `ai-agent-mini-xxxxx`）。以降 `YOUR_PROJECT_ID` と表記します。

### 1.2 Firestore を有効化

1. 左メニュー **「Build」** → **「Firestore Database」**
2. **「データベースを作成」**
3. **本番モードで開始** を選ぶ（あとでルールで制御）
4. ロケーションを選ぶ（例: `asia-northeast1`（東京））
5. **「有効にする」**

### 1.3 Firestore ルールをデプロイ（MVP 用オープン）

1. **「Firestore Database」** → **「ルール」** タブ
2. ルールが `firestore.rules` の内容と同等か確認  
   - 本リポジトリの `firestore.rules` をコピーして反映しても可
3. **「公開」** で保存

### 1.4 サービスアカウント鍵の取得（Firestore Admin SDK 用）

1. 左メニュー **歯車** → **「プロジェクトの設定」**
2. **「サービス アカウント」** タブ
3. **「新しい秘密鍵の生成」** → **「鍵を生成」**
4. ダウンロードした JSON を安全な場所に保存（例: プロジェクト外の `~/keys/firebase-admin-xxx.json`）
5. この JSON から次の 3 つを控える：
   - `project_id` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID` と `GOOGLE_CLOUD_PROJECT`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`（改行は `\n` のまま 1 行で）

#### 1.4.1 ⚠️ 鍵作成が組織ポリシーで制限されている場合

**エラー**: 「サービス アカウントの鍵の作成が組織のポリシーによって制限されている」

**対処法（優先順）**:

**A. 組織管理者に依頼してポリシーを変更（推奨・本番環境）**

**組織管理者が行う手順**:

1. [Google Cloud Console](https://console.cloud.google.com/) にログイン
2. 上部のプロジェクト選択で **組織レベル** または **フォルダレベル** を選択（プロジェクト単位では変更できない場合がある）
3. **「IAM と管理」** → **「組織ポリシー」**（または直接 **「組織ポリシー」** を検索）
4. 検索バーで **`iam.disableServiceAccountKeyCreation`** を検索
5. 該当ポリシーをクリック
6. **「編集」** → **「継承」** または **「無効」** を選択
   - **「継承」**: 親レベルのポリシーを継承（親で無効なら鍵作成可能）
   - **「無効」**: このレベルで鍵作成を許可
7. **「保存」**
8. 変更後、**1.4** の手順で鍵を生成できるようになります

**注意**: 組織ポリシーの変更は即座に反映されますが、場合によっては数分かかることがあります。

**B. Application Default Credentials (ADC) を使用（開発環境・個人プロジェクト）**

鍵ファイルを使わず、`gcloud` CLI で認証する方法：

```bash
# gcloud CLI をインストール（未インストールの場合）
# macOS: brew install google-cloud-sdk
# または: https://cloud.google.com/sdk/docs/install

# ログインして ADC を設定
gcloud auth application-default login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID
```

`.env.local` では、`FIREBASE_CLIENT_EMAIL` と `FIREBASE_PRIVATE_KEY` を **省略** し、代わりに：

```bash
# Firebase（Firestore Admin SDK）
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
# FIREBASE_CLIENT_EMAIL と FIREBASE_PRIVATE_KEY は不要（ADC を使用）

# Vertex AI（同じプロジェクト）
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
# GOOGLE_APPLICATION_CREDENTIALS は不要（ADC を使用）
```

**注意**: この方法は `lib/firebase/config.ts` と `lib/ai/vertex-ai.ts` が ADC に対応している必要があります。現在の実装では鍵ファイルが必要なため、ADC 対応が必要です（後述の「C. 既存の鍵を使用」を推奨）。

**C. 既存の鍵を使用（既に鍵がある場合）**

- 以前にダウンロードした JSON 鍵ファイルがあれば、それを使用
- 鍵ファイルの場所を確認し、`.env.local` に設定

**D. 個人の Google アカウントでプロジェクトを作成（組織ポリシーの影響を受けない）**

1. 個人の Google アカウントで Firebase プロジェクトを新規作成
2. 組織ポリシーの制限を受けないため、鍵を生成可能

**E. Workload Identity Federation を使用（高度・本番向け）**

- 外部 ID プロバイダー（GitHub Actions、AWS など）と連携する方法
- ローカル開発には不向き

**推奨**: 開発環境では **B（ADC）** または **D（個人アカウント）**、本番環境では **A（組織管理者に依頼）** を推奨します。

---

## 2. Google Cloud で行うこと（Vertex AI）

Firebase と **同じプロジェクト** を使います。

### 2.0 課金を有効化（必須）

Vertex AI（Gemini）は **課金が有効なプロジェクト** でないと利用できません。未設定だと 403 `BILLING_DISABLED` になります。

1. [課金の有効化](https://console.cloud.google.com/billing/enable) を開く（または **「お支払い」** → **「課金を有効にする」**）
2. プロジェクトで使用する **課金アカウント** をリンク（未作成の場合は作成）
3. 有効化後、数分待ってから Vertex AI を利用

※ 無料枠があります。[Vertex AI 料金](https://cloud.google.com/vertex-ai/pricing) を参照。

### 2.1 Vertex AI API を有効化

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. 上部のプロジェクト選択で、Firebase で作った **同じプロジェクト** を選択
3. **「API とサービス」** → **「ライブラリ」**
4. **「Vertex AI API」** で検索 → **「有効にする」**

### 2.2 Vertex AI 用サービスアカウントの準備

**A. 既存の Firebase サービスアカウントに権限を付与する場合（推奨・シンプル）**

1. **「IAM と管理」** → **「IAM」**
2. Firebase で使うサービスアカウント（`firebase-adminsdk-xxxxx@...`）を探す
3. **鉛筆アイコン** → **「別のロールを追加」**
4. **「Vertex AI ユーザー」**（`Vertex AI User`）を追加 → **「保存」**
5. **Firestore 用と同じ JSON 鍵** を Vertex AI 用にも使う（`.env.local` で後述）

**B. 別サービスアカウントを作る場合**

1. **「IAM と管理」** → **「サービス アカウント」**
2. **「サービス アカウントを作成」**
3. 名前例: `vertex-ai-user` → **「作成して続行」**
4. ロールで **「Vertex AI ユーザー」** を追加 → **「続行」** → **「完了」**
5. 一覧で該当 SA の **⋮** → **「キーを管理」** → **「鍵を追加」** → **JSON** → ダウンロード
6. この JSON のパスを `GOOGLE_APPLICATION_CREDENTIALS` に設定

---

## 3. 複合インデックスのデプロイ（Firestore）

`skillSteps` の `goalId` + `index` のクエリに必要です。

### 3.1 Firebase CLI の導入

```bash
npm install -g firebase-tools
firebase login
```

### 3.2 プロジェクトで Firebase を初期化（初回のみ）

```bash
cd /Users/jangwoung/workspace/hackthon/ai-agent-mini
firebase use --add
```

- 表示された一覧から、使用する **プロジェクト ID** を選ぶ
- エイリアスは `default` のままで OK
- ルートの `firebase.json` で `firestore.indexes` が参照されています

### 3.3 インデックスのみデプロイ

```bash
firebase deploy --only firestore:indexes
```

- `firestore.indexes.json` の内容が Cloud に反映されます
- 初回はインデックス作成に **数分** かかることがあります
- [Firebase Console](https://console.firebase.google.com/) → **Firestore** → **インデックス** で「構築中」→「有効」になることを確認してください。

---

## 4. `.env.local` の設定

プロジェクト **ルート** に `.env.local` を置きます。

### 4.1 雛形をコピー

```bash
cd /Users/jangwoung/workspace/hackthon/ai-agent-mini
cp .env.local.example .env.local
```

### 4.2 中身を編集

```bash
# Firebase（Firestore Admin SDK）
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@YOUR_PROJECT_ID.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...（省略）...\n-----END PRIVATE KEY-----\n"

# Vertex AI（Firebase と同じプロジェクト）
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID

# Vertex AI 用認証（次のいずれか）
# パターンA: 同じサービスアカウント JSON を参照する場合
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/firebase-admin-xxx.json

# パターンB: Vertex AI 専用 SA を別にした場合
# GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vertex-ai-user.json

# 任意
NEXT_PUBLIC_ENV=development
```

**ポイント**

- `FIREBASE_PRIVATE_KEY`: JSON の `private_key` をそのまま貼る。改行は `\n` として 1 行にし、**全体をダブルクォートで囲む**。
- `GOOGLE_APPLICATION_CREDENTIALS`: **絶対パス** で、鍵 JSON のパスを指定。
- `.env.local` は **Git にコミットしない**（`.gitignore` 済み想定）。

---

## 5. 依存関係のインストール

```bash
cd /Users/jangwoung/workspace/hackthon/ai-agent-mini
npm install
```

ビルドエラーが出る場合は、次も試します。

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 6. 開発サーバー起動

```bash
npm run dev
```

- 起動後、**http://localhost:3000** を開く。

---

## 7. 手動確認フロー（User Story 1）

### 7.1 トップ → 学習目標作成

1. http://localhost:3000 を開く
2. **「学習目標を作成 →」** をクリック
3. `/skill/new` に遷移することを確認

### 7.2 目標入力と 5 ステップ生成

1. **技術**: 例として **「Next.js」** を選択
2. **目標**: 10 文字以上で入力（例: `Next.js で CRUD できる TODO アプリを作る`）
3. **「5ステップを生成」** をクリック
4. 少し待つと **「生成中…」** から遷移することを確認

### 7.3 ステップ一覧の確認

1. `/skill/[goalId]` にリダイレクトされる
2. 画面上部に **目標テキスト** と **技術（Next.js）** が表示される
3. **5 個のステップ** が番号付きで一覧表示される
4. 各ステップをクリックすると `/skill/[goalId]/steps/[stepId]` へ遷移する（Phase 5 未実装なら 404 になることがある）

### 7.4 ここまでで確認できること

- 目標作成 → AI ステップ生成 → Firestore 保存 → 一覧表示まで一連の流れが動くこと。

---

## 8. よくあるトラブル

### 8.0 「サービス アカウントの鍵の作成が組織のポリシーによって制限されている」

**原因**: Google Cloud の組織ポリシー（`iam.disableServiceAccountKeyCreation`）で鍵作成が制限されている。

**対処法**:
- **1.4.1** セクションを参照
- 組織管理者に依頼してポリシーを変更（本番環境）
- Application Default Credentials (ADC) を使用（開発環境）
- 既存の鍵ファイルがあればそれを使用
- 個人の Google アカウントでプロジェクトを作成（組織ポリシーの影響を受けない）

### 8.1 「Missing Firebase configuration」 / 「Missing GOOGLE_CLOUD_PROJECT」

- `.env.local` が **プロジェクトルート** にあるか確認
- 変数名の typo、値の前後スペースや余分な改行がないか確認
- `npm run dev` を **再起動** してから再度試す

### 8.2 「Permission denied」 / Vertex AI エラー

- Vertex AI API が **有効** か確認
- 使用するサービスアカウントに **Vertex AI ユーザー** ロールが付いているか確認
- `GOOGLE_APPLICATION_CREDENTIALS` のパスが **絶対パス** で正しいか確認

### 8.3 Firestore 「The query requires an index」

- `firebase deploy --only firestore:indexes` を実行したか確認
- Firestore コンソールの **インデックス** で、該当インデックスが **有効** になってから再度リクエスト

### 8.4 `FIREBASE_PRIVATE_KEY` が invalid

- 鍵を **1 行** にし、改行を `\n` でエスケープしているか確認
- 値全体を `"..."` で囲んでいるか確認
- 先頭・末尾にスペースが入っていないか確認

### 8.5 `npm run build` で `@google-cloud/firestore` エラー

- `rm -rf node_modules package-lock.json && npm install` を試す
- `firebase-admin` / `@google-cloud/vertexai` のバージョンを `package.json` で確認し、必要に応じてアップデート

### 8.6 「AIステップ生成に失敗しました。再生成してください。」

**まずログで 403 Billing / 404 Model が出ていないか確認**

- `[generate-steps] first attempt failed: ... 403 ... BILLING_DISABLED` の場合  
  → **GCP で課金を有効にする**。  
  [課金の有効化](https://console.cloud.google.com/billing/enable?project=YOUR_PROJECT_ID) でリンクし、数分待ってから再試行。

- `404 ... gemini-1.5-flash ... was not found` の場合  
  → **モデル ID が廃止済み**。本プロジェクトでは `gemini-2.0-flash-001` を使用しています（`lib/ai/vertex-ai.ts`）。  
  旧 `gemini-1.5-flash` を使っている場合は差し替えて再試行。

**それ以外の原因の切り分け**:

1. **サーバーログを確認する**  
   `npm run dev` を実行しているターミナルに、`[generate-steps]` または `[POST /api/skill/generate]` で始まるログが出ます。  
   - `first attempt failed:` / `retry failed:` → 続くメッセージで原因を確認（認証エラー、Zod バリデーション、JSON パース失敗など）
   - `extractJson: no JSON array found` → AI が JSON 配列以外を返している
   - `Vertex AI empty text` → 安全フィルタや API エラーで出力が空
   - `JSON.parse failed` → AI の出力が不正な JSON
   - `Zod parse failed` → ステップ数が 5 でない、または `title` / `task` / `deliverable` の形式が想定と異なる

2. **よくある原因と対処**
   - **認証（403 / 401）**: `GOOGLE_APPLICATION_CREDENTIALS` のパスが正しいか、同じサービスアカウントに **Vertex AI ユーザー** が付与されているか確認
   - **Vertex AI API 未有効**: Google Cloud コンソールで「Vertex AI API」を有効化
   - **リージョン**: コード上は `us-central1`。別リージョンを使う場合は `lib/ai/vertex-ai.ts` の `location` を変更
   - **Zod エラー**: AI が 5 件でない・形式違いで落ちている場合。ログの `parsed=` で実際の構造を確認し、プロンプトやスキーマ調整の検討

---

## 9. Firebase で行うこと・チェックリスト（まとめ）

| 項目 | 実施場所 | 内容 |
|------|----------|------|
| プロジェクト作成 | Firebase Console | プロジェクト ID を控える |
| **課金を有効化** | Google Cloud お支払い | プロジェクトに課金アカウントをリンク（Vertex AI 必須） |
| Firestore 有効化 | Firestore Database | ロケーション選択して作成 |
| ルール設定 | Firestore → ルール | MVP 用オープンルールをデプロイ |
| サービスアカウント鍵 | プロジェクトの設定 → サービスアカウント | 「新しい秘密鍵の生成」→ JSON 保存 |
| Vertex AI API | Google Cloud Console | 同じプロジェクトで「Vertex AI API」を有効化 |
| Vertex AI 権限 | IAM | 使用する SA に「Vertex AI ユーザー」を付与 |
| 複合インデックス | ローカル + Firebase CLI | `firebase deploy --only firestore:indexes` |

---

## 10. 次のステップ

- Phase 5（User Story 2）: ステップ詳細・提出物の保存
- Phase 6（User Story 3）: AI レビュー生成

---

**参考**

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vertex AI ドキュメント](https://cloud.google.com/vertex-ai/docs)
- 本リポジトリ: `specs/001-skill-steps/quickstart.md`, `firestore.rules`, `firestore.indexes.json`
