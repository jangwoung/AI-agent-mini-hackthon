# Quickstart Guide: AI-Powered Skill Learning Steps MVP

**Feature**: 001-skill-steps  
**Date**: 2025-01-25  
**Purpose**: Get the MVP running locally in under 30 minutes

## Prerequisites

- Node.js 20.x or later
- npm or yarn
- Google Cloud account (for Vertex AI)
- Firebase account (for Firestore)

## Step 1: Project Setup

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd ai-agent-mini

# Install dependencies
npm install

# Or with yarn
yarn install
```

## Step 2: Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name: `ai-agent-mini` (or your choice)
   - Enable Google Analytics (optional for MVP)

2. **Enable Firestore**:
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for MVP, we'll use open rules)
   - Select location (choose closest to you)

3. **Get Firebase Config**:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Add web app
   - Copy the config object (we'll use it in `.env.local`)

4. **Create Service Account** (for Admin SDK):
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file (we'll use it in `.env.local`)

## Step 3: Google Cloud / Vertex AI Setup

1. **Enable Vertex AI API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project (same project)
   - Go to "APIs & Services" → "Library"
   - Search "Vertex AI API"
   - Click "Enable"

2. **Create Service Account for Vertex AI**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `vertex-ai-user`
   - Grant role: `Vertex AI User` (`roles/aiplatform.user`)
   - Create and download JSON key (we'll use it in `.env.local`)

## Step 4: Environment Variables

Create `.env.local` in project root:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vertex-ai-service-account.json

# Optional: Development flags
NEXT_PUBLIC_ENV=development
```

**Important**:
- `FIREBASE_PRIVATE_KEY`: Must include `\n` for newlines (or use actual newlines in file)
- `GOOGLE_APPLICATION_CREDENTIALS`: Absolute path to service account JSON file
- Never commit `.env.local` to git (should be in `.gitignore`)

## Step 5: Install Additional Dependencies

```bash
# Firebase Admin SDK
npm install firebase-admin

# Vertex AI SDK
npm install @google-cloud/aiplatform

# Zod (validation)
npm install zod

# TypeScript types (if needed)
npm install --save-dev @types/node
```

## Step 6: Initialize Firebase

Create `lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = getFirestore();
```

## Step 7: Initialize Vertex AI

Create `lib/ai/vertex-ai.ts`:

```typescript
import { VertexAI } from '@google-cloud/aiplatform';

export const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: 'us-central1', // Change to your preferred region
});

export const model = 'gemini-1.5-flash';
```

## Step 8: Run Development Server

```bash
npm run dev
# Or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 9: Test Basic Flow

1. **Create Goal**:
   - Navigate to `/skill/new`
   - Select "Next.js"
   - Enter goal: "Create a CRUD app"
   - Submit

2. **View Steps**:
   - Should redirect to `/skill/[goalId]`
   - See 5 steps displayed

3. **Submit Work**:
   - Click on a step
   - Enter code or URL
   - Submit

4. **Get Review**:
   - Trigger review
   - See Keep/Problem/Try/Next feedback

5. **Mark Complete**:
   - Check completion checkbox
   - See status update in list

## Troubleshooting

### Firebase Connection Error

**Error**: `FirebaseError: Missing or insufficient permissions`

**Solution**:
- Check Firestore Security Rules (should be open for MVP)
- Verify `FIREBASE_PRIVATE_KEY` has correct format (with `\n`)

### Vertex AI Error

**Error**: `Permission denied` or `API not enabled`

**Solution**:
- Verify Vertex AI API is enabled in Google Cloud Console
- Check Service Account has `roles/aiplatform.user` role
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct

### AI Response Invalid

**Error**: `JSON parse error` or `Zod validation failed`

**Solution**:
- Check AI prompt includes JSON schema strict mode
- Verify Zod schema matches AI response structure
- Check retry logic is working (should retry once)

### Firestore Quota Exceeded

**Error**: `Quota exceeded`

**Solution**:
- Check Firebase Console usage dashboard
- Implement client-side caching
- Reduce unnecessary reads/writes

## Next Steps

- Review [data-model.md](./data-model.md) for Firestore structure
- Review [contracts/](./contracts/) for API specifications
- Review [research.md](./research.md) for implementation details
- Proceed to `/speckit.tasks` to break down into implementation tasks

## Development Commands

```bash
# Run dev server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start production server
npm start
```

## Project Structure Reference

```
app/
├── (routes)/
│   └── skill/
│       ├── new/page.tsx
│       ├── [goalId]/page.tsx
│       └── [goalId]/steps/[stepId]/page.tsx
├── api/
│   └── skill/
│       ├── generate/route.ts
│       └── review/route.ts
├── components/
│   └── skill/
└── lib/
    ├── firebase/
    ├── ai/
    └── models/
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase service account private key |
| `GOOGLE_CLOUD_PROJECT` | Yes | Google Cloud project ID (same as Firebase) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes | Path to Vertex AI service account JSON |

## Support

- Firebase Docs: https://firebase.google.com/docs
- Vertex AI Docs: https://cloud.google.com/vertex-ai/docs
- Next.js Docs: https://nextjs.org/docs
