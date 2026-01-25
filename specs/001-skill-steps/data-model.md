# Data Model: AI-Powered Skill Learning Steps MVP

**Feature**: 001-skill-steps  
**Date**: 2025-01-25  
**Storage**: Firebase Firestore (NoSQL document database)

## Entity Relationships

```
SkillGoal (1) ──< (many) SkillStep (1) ──< (0..1) Submission (1) ──< (0..1) Review
```

- One SkillGoal has many SkillSteps (exactly 5)
- One SkillStep has zero or one Submission
- One SkillStep has zero or one Review (requires Submission)

## Entities

### 1. SkillGoal

**Collection**: `skillGoals`  
**Document ID**: Auto-generated (Firestore)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Document ID (auto-generated) | UUID format |
| `skillType` | string | Yes | Technology type: "nextjs" \| "go" \| "gcp" | Enum: ["nextjs", "go", "gcp"] |
| `goalText` | string | Yes | User's learning goal in plain text | Min 10 chars, max 500 chars |
| `createdAt` | timestamp | Yes | Creation timestamp | ISO 8601 format |
| `userId` | string | No | User ID (optional for MVP, required for production) | UUID format if present |

**Indexes**: None required (single document reads by ID)

**Example Document**:
```json
{
  "id": "goal_abc123",
  "skillType": "nextjs",
  "goalText": "Create a CRUD app with Next.js",
  "createdAt": "2025-01-25T10:00:00Z",
  "userId": null
}
```

**Validation Rules**:
- `skillType`: Must be one of ["nextjs", "go", "gcp"]
- `goalText`: Must be non-empty, trimmed, 10-500 characters
- `createdAt`: Must be valid ISO 8601 timestamp

**State Transitions**: None (immutable after creation)

---

### 2. SkillStep

**Collection**: `skillSteps`  
**Document ID**: Auto-generated (Firestore)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Document ID (auto-generated) | UUID format |
| `goalId` | string | Yes | Reference to parent SkillGoal | Must exist in `skillGoals` |
| `index` | number | Yes | Sequential step number (1-5) | Integer, 1 <= index <= 5 |
| `title` | string | Yes | Step title | Min 5 chars, max 200 chars |
| `task` | string | Yes | Task description | Min 20 chars, max 2000 chars |
| `deliverable` | string | Yes | Deliverable criteria | Min 10 chars, max 500 chars |
| `done` | boolean | Yes | Completion status | Boolean, default false |
| `createdAt` | timestamp | Yes | Creation timestamp | ISO 8601 format |

**Indexes**: 
- `goalId` (for querying steps by goal: `WHERE goalId == 'goal_abc123'`)

**Example Document**:
```json
{
  "id": "step_xyz789",
  "goalId": "goal_abc123",
  "index": 1,
  "title": "Set up Next.js project",
  "task": "Create a new Next.js project using create-next-app. Configure TypeScript and ESLint.",
  "deliverable": "A working Next.js project with TypeScript support",
  "done": false,
  "createdAt": "2025-01-25T10:00:05Z"
}
```

**Validation Rules**:
- `goalId`: Must reference existing SkillGoal
- `index`: Must be integer between 1 and 5 (inclusive)
- `title`, `task`, `deliverable`: Must be non-empty, trimmed
- `done`: Boolean, defaults to false

**State Transitions**:
- `done`: false → true (user marks complete)
- `done`: true → false (user unchecks)

**Constraints**:
- Exactly 5 steps per goal (enforced at creation time)
- `index` must be unique per `goalId` (1, 2, 3, 4, 5)

---

### 3. Submission

**Collection**: `submissions`  
**Document ID**: Auto-generated (Firestore)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Document ID (auto-generated) | UUID format |
| `stepId` | string | Yes | Reference to parent SkillStep | Must exist in `skillSteps` |
| `content` | string | Yes | Submission content (code text or URL) | Min 1 char, max 100000 chars |
| `contentType` | string | Yes | Type: "code" \| "url" | Enum: ["code", "url"] |
| `createdAt` | timestamp | Yes | Creation timestamp | ISO 8601 format |

**Indexes**: 
- `stepId` (for querying submission by step: `WHERE stepId == 'step_xyz789'`)

**Example Document**:
```json
{
  "id": "submission_def456",
  "stepId": "step_xyz789",
  "content": "https://github.com/user/my-nextjs-app",
  "contentType": "url",
  "createdAt": "2025-01-25T10:30:00Z"
}
```

**Validation Rules**:
- `stepId`: Must reference existing SkillStep
- `content`: 
  - If `contentType == "code"`: Must be non-empty text (code)
  - If `contentType == "url"`: Must be valid URL format (http:// or https://)
- `contentType`: Must be one of ["code", "url"]

**State Transitions**: None (immutable after creation, but can be replaced by new submission)

**Constraints**:
- One submission per step (enforced: delete old submission before creating new, or use update)

---

### 4. Review

**Collection**: `reviews`  
**Document ID**: Auto-generated (Firestore)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Document ID (auto-generated) | UUID format |
| `stepId` | string | Yes | Reference to parent SkillStep | Must exist in `skillSteps` |
| `keep` | string | Yes | "Keep" feedback (what's good) | Min 10 chars, max 2000 chars |
| `problem` | string | Yes | "Problem" feedback (what needs improvement) | Min 10 chars, max 2000 chars |
| `try` | string | Yes | "Try" feedback (suggestions) | Min 10 chars, max 2000 chars |
| `next` | string | Yes | "Next" feedback (next steps) | Min 10 chars, max 2000 chars |
| `createdAt` | timestamp | Yes | Creation timestamp | ISO 8601 format |

**Indexes**: 
- `stepId` (for querying review by step: `WHERE stepId == 'step_xyz789'`)

**Example Document**:
```json
{
  "id": "review_ghi789",
  "stepId": "step_xyz789",
  "keep": "良い点: プロジェクト構造が整理されている。TypeScriptの設定が適切。",
  "problem": "改善点: エラーハンドリングが不足している。",
  "try": "試してみて: try-catchブロックを追加し、ユーザーフレンドリーなエラーメッセージを表示。",
  "next": "次に: データベース接続を実装し、CRUD操作を追加。",
  "createdAt": "2025-01-25T10:35:00Z"
}
```

**Validation Rules**:
- `stepId`: Must reference existing SkillStep
- `keep`, `problem`, `try`, `next`: Must be non-empty, trimmed, 10-2000 characters each

**State Transitions**: None (immutable after creation, but can be regenerated by deleting old and creating new)

**Constraints**:
- One review per step (enforced: delete old review before creating new, or use update)
- Review requires Submission (enforced at application level, not database level)

---

## Firestore Security Rules

### MVP Rules (Development Only)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // SkillGoals: Open read/write for MVP
    match /skillGoals/{goalId} {
      allow read, write: if true;
    }
    
    // SkillSteps: Open read/write for MVP
    match /skillSteps/{stepId} {
      allow read, write: if true;
    }
    
    // Submissions: Open read/write for MVP
    match /submissions/{submissionId} {
      allow read, write: if true;
    }
    
    // Reviews: Open read/write for MVP
    match /reviews/{reviewId} {
      allow read, write: if true;
    }
  }
}
```

### Production Rules (Future - Requires Authentication)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function: Check if user owns the goal
    function isOwner(goalId) {
      return request.auth != null && 
             get(/databases/$(database)/documents/skillGoals/$(goalId)).data.userId == request.auth.uid;
    }
    
    // SkillGoals: Users can only read/write their own goals
    match /skillGoals/{goalId} {
      allow read, write: if request.auth != null && 
                              resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
    }
    
    // SkillSteps: Users can only read/write steps for their own goals
    match /skillSteps/{stepId} {
      allow read, write: if request.auth != null && 
                              isOwner(resource.data.goalId);
      allow create: if request.auth != null && 
                         isOwner(request.resource.data.goalId);
    }
    
    // Submissions: Users can only read/write submissions for their own steps
    match /submissions/{submissionId} {
      allow read, write: if request.auth != null && 
                              isOwner(get(/databases/$(database)/documents/skillSteps/$(resource.data.stepId)).data.goalId);
      allow create: if request.auth != null && 
                         isOwner(get(/databases/$(database)/documents/skillSteps/$(request.resource.data.stepId)).data.goalId);
    }
    
    // Reviews: Users can only read/write reviews for their own steps
    match /reviews/{reviewId} {
      allow read, write: if request.auth != null && 
                              isOwner(get(/databases/$(database)/documents/skillSteps/$(resource.data.stepId)).data.goalId);
      allow create: if request.auth != null && 
                         isOwner(get(/databases/$(database)/documents/skillSteps/$(request.resource.data.stepId)).data.goalId);
    }
  }
}
```

---

## Data Access Patterns

### Query Patterns

1. **Get all steps for a goal**:
   ```typescript
   db.collection('skillSteps')
     .where('goalId', '==', goalId)
     .orderBy('index', 'asc')
   ```

2. **Get submission for a step**:
   ```typescript
   db.collection('submissions')
     .where('stepId', '==', stepId)
     .limit(1)
   ```

3. **Get review for a step**:
   ```typescript
   db.collection('reviews')
     .where('stepId', '==', stepId)
     .limit(1)
   ```

### Write Patterns

1. **Create goal with 5 steps** (transaction):
   - Create SkillGoal document
   - Create 5 SkillStep documents (batch write)

2. **Update step completion**:
   - Update `done` field in SkillStep document

3. **Create submission** (replace if exists):
   - Delete existing submission for step (if any)
   - Create new Submission document

4. **Create review** (replace if exists):
   - Delete existing review for step (if any)
   - Create new Review document

---

## TypeScript Types

```typescript
// lib/firebase/types.ts

export type SkillType = 'nextjs' | 'go' | 'gcp';

export interface SkillGoal {
  id: string;
  skillType: SkillType;
  goalText: string;
  createdAt: Date;
  userId?: string;
}

export interface SkillStep {
  id: string;
  goalId: string;
  index: number; // 1-5
  title: string;
  task: string;
  deliverable: string;
  done: boolean;
  createdAt: Date;
}

export type SubmissionContentType = 'code' | 'url';

export interface Submission {
  id: string;
  stepId: string;
  content: string;
  contentType: SubmissionContentType;
  createdAt: Date;
}

export interface Review {
  id: string;
  stepId: string;
  keep: string;
  problem: string;
  try: string;
  next: string;
  createdAt: Date;
}
```

---

## Validation Schemas (Zod)

```typescript
// lib/models/schemas.ts

import { z } from 'zod';

export const SkillTypeSchema = z.enum(['nextjs', 'go', 'gcp']);

export const SkillGoalSchema = z.object({
  skillType: SkillTypeSchema,
  goalText: z.string().min(10).max(500).trim(),
});

export const SkillStepSchema = z.object({
  goalId: z.string().uuid(),
  index: z.number().int().min(1).max(5),
  title: z.string().min(5).max(200).trim(),
  task: z.string().min(20).max(2000).trim(),
  deliverable: z.string().min(10).max(500).trim(),
  done: z.boolean().default(false),
});

export const SubmissionContentTypeSchema = z.enum(['code', 'url']);

export const SubmissionSchema = z.object({
  stepId: z.string().uuid(),
  content: z.string().min(1).max(100000),
  contentType: SubmissionContentTypeSchema,
}).refine(
  (data) => {
    if (data.contentType === 'url') {
      try {
        new URL(data.content);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  },
  { message: 'Content must be a valid URL when contentType is "url"' }
);

export const ReviewSchema = z.object({
  stepId: z.string().uuid(),
  keep: z.string().min(10).max(2000).trim(),
  problem: z.string().min(10).max(2000).trim(),
  try: z.string().min(10).max(2000).trim(),
  next: z.string().min(10).max(2000).trim(),
});
```
