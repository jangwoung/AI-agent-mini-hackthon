# アーキテクチャ図

## 1. 技術スタック構成（現在）

```mermaid
graph TB
    subgraph "フロントエンド"
        UI[Next.js 14 App Router<br/>React 18 + TypeScript]
        Pages[Pages<br/>/skill/new<br/>/skill/[goalId]<br/>/skill/[goalId]/steps/[stepId]]
        Components[Components<br/>GoalForm<br/>StepList<br/>StepDetail<br/>SubmissionForm<br/>ReviewDisplay]
    end

    subgraph "API Layer"
        API1[POST /api/skill/generate<br/>ステップ生成]
        API2[POST /api/skill/review<br/>レビュー生成]
        API3[GET/POST /api/skill/step/[stepId]<br/>ステップ操作]
        API4[POST /api/skill/submission<br/>提出物保存]
    end

    subgraph "ビジネスロジック"
        BL1[lib/ai/generate-steps.ts<br/>ステップ生成ロジック]
        BL2[lib/ai/generate-review.ts<br/>レビュー生成ロジック]
        BL3[lib/firebase/firestore.ts<br/>データ永続化]
        BL4[lib/utils/validation.ts<br/>Zodバリデーション]
    end

    subgraph "外部サービス"
        VertexAI[Vertex AI<br/>Gemini 2.0 Flash]
        Firestore[(Firestore<br/>データベース)]
    end

    UI --> Pages
    Pages --> Components
    Components --> API1
    Components --> API2
    Components --> API3
    Components --> API4

    API1 --> BL1
    API1 --> BL3
    API2 --> BL2
    API2 --> BL3
    API3 --> BL3
    API4 --> BL3

    BL1 --> VertexAI
    BL2 --> VertexAI
    BL3 --> Firestore
    BL4 --> API1
    BL4 --> API2

    style UI fill:#e1f5ff
    style VertexAI fill:#fff4e1
    style Firestore fill:#fff4e1
```

## 2. AI活用の棲み分け（現在）

```mermaid
graph LR
    subgraph "ユーザー入力"
        Goal[目標入力<br/>skillType + goalText]
        Submission[提出物<br/>コード/URL]
    end

    subgraph "AI処理（Vertex AI Gemini）"
        AI1[ステップ生成<br/>generate-steps.ts]
        AI2[レビュー生成<br/>generate-review.ts]
    end

    subgraph "AI出力"
        Steps[5つの学習ステップ<br/>title/task/deliverable]
        Review[フィードバック<br/>Keep/Problem/Try/Next]
    end

    subgraph "データ保存"
        DB[(Firestore)]
    end

    Goal --> AI1
    AI1 --> Steps
    Steps --> DB

    Submission --> AI2
    AI2 --> Review
    Review --> DB

    style AI1 fill:#ffd700
    style AI2 fill:#ffd700
    style Steps fill:#90ee90
    style Review fill:#90ee90
```

## 3. AI活用の棲み分け（展望）

```mermaid
graph TB
    subgraph "現在のAI活用"
        Current1[1. ステップ生成<br/>目標から5ステップを自動生成]
        Current2[2. レビュー生成<br/>提出物へのフィードバック]
    end

    subgraph "近未来（v0.2）"
        Future1[3. 自動リスケジュール<br/>未達タスクの再配置]
        Future2[4. 復習最適化<br/>間隔反復による復習配置]
    end

    subgraph "将来拡張（v0.3+）"
        Future3[5. 挽回モード提案<br/>期限迫った場合の圧縮プラン]
        Future4[6. 学習パターン分析<br/>ユーザーの学習傾向から最適化]
        Future5[7. 難易度調整<br/>理解度に応じたステップ難易度調整]
    end

    subgraph "AIが担当しない領域"
        Manual1[手動操作<br/>ステップ完了チェック]
        Manual2[データ管理<br/>CRUD操作]
        Manual3[UI表示<br/>データの可視化]
    end

    Current1 --> Future1
    Current2 --> Future2
    Future1 --> Future3
    Future2 --> Future4
    Future3 --> Future5

    style Current1 fill:#90ee90
    style Current2 fill:#90ee90
    style Future1 fill:#ffd700
    style Future2 fill:#ffd700
    style Future3 fill:#ffb6c1
    style Future4 fill:#ffb6c1
    style Future5 fill:#ffb6c1
    style Manual1 fill:#d3d3d3
    style Manual2 fill:#d3d3d3
    style Manual3 fill:#d3d3d3
```

## 4. データフロー（現在）

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant UI as フロントエンド
    participant API as API Routes
    participant AI as Vertex AI
    participant DB as Firestore

    User->>UI: 目標入力
    UI->>API: POST /api/skill/generate
    API->>AI: ステップ生成リクエスト
    AI-->>API: 5ステップ（JSON）
    API->>DB: Goal + Steps保存
    DB-->>API: 保存完了
    API-->>UI: GoalId + Steps
    UI-->>User: ステップ一覧表示

    User->>UI: 提出物入力
    UI->>API: POST /api/skill/submission
    API->>DB: Submission保存
    DB-->>API: 保存完了

    User->>UI: レビュー実行
    UI->>API: POST /api/skill/review
    API->>DB: Step + Submission取得
    API->>AI: レビュー生成リクエスト
    AI-->>API: Review（Keep/Problem/Try/Next）
    API->>DB: Review保存
    DB-->>API: 保存完了
    API-->>UI: Review
    UI-->>User: レビュー表示
```

## 5. システム全体像（現在 + 展望）

```mermaid
graph TB
    subgraph "プレゼンテーション層"
        Frontend[Next.js Frontend<br/>React Components]
    end

    subgraph "アプリケーション層"
        API[API Routes<br/>Next.js API]
        Validation[バリデーション<br/>Zod]
    end

    subgraph "ドメイン層"
        StepGen[ステップ生成ロジック]
        ReviewGen[レビュー生成ロジック]
        ScheduleLogic[スケジュール管理<br/>※将来実装]
    end

    subgraph "インフラ層"
        VertexAI[Vertex AI<br/>Gemini 2.0 Flash]
        Firestore[(Firestore<br/>NoSQL Database)]
    end

    subgraph "AI活用領域"
        AI1[生成系AI<br/>ステップ・レビュー生成]
        AI2[分析系AI<br/>※将来: 学習パターン分析]
        AI3[最適化AI<br/>※将来: スケジュール最適化]
    end

    Frontend --> API
    API --> Validation
    API --> StepGen
    API --> ReviewGen
    API --> ScheduleLogic

    StepGen --> VertexAI
    ReviewGen --> VertexAI
    ScheduleLogic --> Firestore

    VertexAI --> AI1
    VertexAI -.将来.-> AI2
    VertexAI -.将来.-> AI3

    StepGen --> Firestore
    ReviewGen --> Firestore

    style AI1 fill:#90ee90
    style AI2 fill:#ffd700
    style AI3 fill:#ffd700
    style ScheduleLogic fill:#ffd700
```

## 6. AI活用の責任分離

```mermaid
graph LR
    subgraph "AIが担当"
        A1[コンテンツ生成<br/>ステップ・レビュー]
        A2[パターン認識<br/>学習傾向分析]
        A3[最適化提案<br/>スケジュール調整]
    end

    subgraph "従来システムが担当"
        B1[データ永続化<br/>CRUD操作]
        B2[バリデーション<br/>入力検証]
        B3[UI表示<br/>データ可視化]
        B4[ビジネスルール<br/>状態管理]
    end

    subgraph "ユーザーが担当"
        C1[目標設定]
        C2[提出物作成]
        C3[完了チェック]
        C4[手動調整]
    end

    A1 --> B1
    A2 --> B4
    A3 --> B4
    B1 --> B3
    B2 --> B1
    C1 --> A1
    C2 --> A1
    C3 --> B4
    C4 --> A3

    style A1 fill:#90ee90
    style A2 fill:#ffd700
    style A3 fill:#ffd700
    style B1 fill:#e1f5ff
    style B2 fill:#e1f5ff
    style B3 fill:#e1f5ff
    style B4 fill:#e1f5ff
```

## 補足説明

### 現在のAI活用
- **ステップ生成**: ユーザーの目標と技術スタックから、5つの具体的な学習ステップを自動生成
- **レビュー生成**: 提出物に対して、Keep/Problem/Try/Nextの4項目で構造化されたフィードバックを生成

### 展望されるAI活用
- **自動リスケジュール**: 未達タスクを自動的に再配置（v0.2）
- **復習最適化**: 間隔反復理論に基づいた復習タイミングの最適化（v0.2）
- **挽回モード**: 期限が迫った場合の圧縮プラン提案（v0.3+）
- **学習パターン分析**: ユーザーの学習傾向から最適な学習計画を提案（v0.3+）

### AIが担当しない領域
- データの永続化（Firestoreへの保存）
- 入力バリデーション（Zodによる型安全性）
- UI表示（Reactコンポーネント）
- 基本的なCRUD操作
