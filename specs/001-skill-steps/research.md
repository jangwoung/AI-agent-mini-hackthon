# Research: AI-Powered Skill Learning Steps MVP

**Feature**: 001-skill-steps  
**Date**: 2025-01-25  
**Purpose**: Resolve technical unknowns and establish best practices for Next.js + Firebase + Vertex AI implementation

## Technology Decisions

### 1. Next.js App Router Structure

**Decision**: Use Next.js 14+ App Router with TypeScript, route groups for organization.

**Rationale**: 
- App Router provides server components, API routes, and client components in unified structure
- TypeScript ensures type safety for Firestore documents and AI responses
- Route groups `(routes)` allow shared layouts without affecting URL structure
- Built-in optimizations (image, font, script) reduce setup overhead

**Alternatives considered**:
- Pages Router: Legacy, less optimal for server components
- Remix: Similar features but smaller ecosystem
- SvelteKit: Good but team familiarity with React/Next.js

**Implementation notes**:
- Use Server Components by default, `'use client'` only when needed (interactivity, hooks)
- API routes in `/app/api` use Route Handlers (not Pages API)

---

### 2. Firebase Firestore Data Model

**Decision**: Use Firestore collections: `skillGoals`, `skillSteps`, `submissions`, `reviews`. Denormalize for read performance.

**Rationale**:
- NoSQL structure fits document-based entities (Goal → Steps → Submissions → Reviews)
- Real-time updates possible if needed later
- Free tier sufficient for MVP (50K reads/day, 20K writes/day)
- Denormalization reduces read queries (fetch goal + steps in 2 queries vs nested reads)

**Alternatives considered**:
- localStorage: Simple but no persistence across devices, limited capacity
- PostgreSQL: Overkill for MVP, requires backend infrastructure
- Supabase: Similar to Firebase but team chose Firebase for Google AI integration

**Collection structure**:
```
skillGoals/{goalId}
  - id, skillType, goalText, createdAt, userId (optional)

skillSteps/{stepId}
  - id, goalId, index, title, task, deliverable, done, createdAt

submissions/{submissionId}
  - id, stepId, content, createdAt

reviews/{reviewId}
  - id, stepId, keep, problem, try, next, createdAt
```

**Indexes required**:
- `skillSteps`: `goalId` (for querying steps by goal)
- `submissions`: `stepId` (for querying submission by step)
- `reviews`: `stepId` (for querying review by step)

---

### 3. Vertex AI Integration (Gemini)

**Decision**: Use Vertex AI SDK (`@google-cloud/aiplatform`) with Gemini 1.5 Flash, server-side only (Route Handlers).

**Rationale**:
- Gemini 1.5 Flash: Fast, cost-effective for MVP, supports JSON schema strict mode
- Server-side only: Protects API keys, enables retry logic, rate limiting
- JSON schema strict: Ensures structured responses, reduces parsing errors
- Service Account auth: IAM-based, no API keys in code

**Alternatives considered**:
- OpenAI API: Good but requires API key management, different pricing
- Anthropic Claude: Excellent but separate billing/integration
- Direct Gemini API: Vertex AI provides better enterprise features, IAM integration

**Model selection**: `gemini-1.5-flash` (fast, low cost, JSON mode support)

**Authentication**:
- Service Account with `roles/aiplatform.user` role
- Credentials via `GOOGLE_APPLICATION_CREDENTIALS` env var or default credentials
- No API keys in client code

---

### 4. JSON Schema Validation for AI Responses

**Decision**: Use Zod schemas for AI response validation, strict JSON schema in Vertex AI prompts.

**Rationale**:
- Zod: TypeScript-first, runtime validation, excellent error messages
- JSON schema strict mode: Vertex AI enforces structure, reduces invalid responses
- Retry logic: On validation failure, retry once before user error
- Type safety: Zod schemas generate TypeScript types

**Schema structure**:
```typescript
// For step generation
const StepSchema = z.object({
  title: z.string(),
  task: z.string(),
  deliverable: z.string()
});
const StepsResponseSchema = z.array(StepSchema).length(5);

// For review generation
const ReviewSchema = z.object({
  keep: z.string(),
  problem: z.string(),
  try: z.string(),
  next: z.string()
});
```

**Error handling**:
1. Parse AI response with Zod
2. If invalid: Retry once (with same prompt)
3. If still invalid: Return user-friendly error "再生成してください"

---

### 5. Firestore Security Rules

**Decision**: MVP uses open read/write rules initially, production requires user authentication.

**Rationale**:
- MVP: Fast iteration, no auth complexity
- Production: Add Firebase Auth, restrict by `userId`
- Rules structure prepared for auth migration

**MVP Rules** (development only):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /skillGoals/{goalId} {
      allow read, write: if true; // MVP: open access
    }
    match /skillSteps/{stepId} {
      allow read, write: if true;
    }
    match /submissions/{submissionId} {
      allow read, write: if true;
    }
    match /reviews/{reviewId} {
      allow read, write: if true;
    }
  }
}
```

**Production Rules** (future):
```javascript
match /skillGoals/{goalId} {
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

---

### 6. UI Component Structure

**Decision**: Feature-based components in `/app/components/skill/`, shared UI in `/app/components/ui/`.

**Rationale**:
- Feature grouping: Easy to find, maintain, test
- Shared UI: Reusable buttons, inputs, cards
- Server/Client separation: Server Components by default, `'use client'` for interactivity

**Component breakdown**:
- `GoalForm.tsx`: Server component, form handling with client component for submission
- `StepList.tsx`: Server component, fetches steps from Firestore
- `StepCard.tsx`: Client component (interactive checkbox)
- `StepDetail.tsx`: Server component, displays task, submission form, review
- `SubmissionForm.tsx`: Client component (textarea, URL input)
- `ReviewDisplay.tsx`: Server component (displays review sections)

---

### 7. Error Handling Strategy

**Decision**: Centralized error handling in API routes, user-friendly messages, logging for debugging.

**Rationale**:
- User-friendly: "再生成してください" instead of "JSON parse error"
- Logging: Server-side logs for AI failures, validation errors
- Retry: Automatic retry for AI calls (1 attempt)
- Graceful degradation: Show partial data if possible

**Error types**:
- AI service errors: Retry once, then user message
- Validation errors: Immediate user feedback with field-level errors
- Firestore errors: User message, log details server-side
- Network errors: Retry UI, clear error message

---

### 8. Testing Strategy (MVP)

**Decision**: Manual testing for MVP, automated tests for critical paths (AI integration, data persistence).

**Rationale**:
- MVP timeline: 3 hours, focus on functionality
- Critical paths: AI responses, Firestore writes must work
- Manual tests: User flows (create goal → submit → review → complete)
- Automated: Unit tests for AI parsing, Firestore helpers

**Minimum test coverage**:
- ✅ Unit: AI response parsing (Zod validation)
- ✅ Unit: Firestore document conversion (types)
- ✅ Integration: API routes (generate, review)
- ⚠️ E2E: Manual testing of 4 user flows

---

### 9. Deployment & Environment

**Decision**: Vercel for Next.js deployment, Firebase project for Firestore, Google Cloud Project for Vertex AI.

**Rationale**:
- Vercel: Zero-config Next.js deployment, environment variables management
- Firebase: Managed Firestore, easy setup
- Google Cloud: Vertex AI requires GCP project, same billing as Firebase

**Environment variables**:
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR use default credentials in Vercel
```

---

### 10. Cost & Quota Management

**Decision**: Monitor Firestore reads/writes, Vertex AI token usage, implement basic rate limiting.

**Rationale**:
- Firestore free tier: 50K reads/day, 20K writes/day (sufficient for MVP)
- Vertex AI: Pay-per-use, monitor token counts
- Rate limiting: Prevent abuse, protect quota

**Monitoring**:
- Firestore: Use Firebase Console usage dashboard
- Vertex AI: Use Cloud Console billing dashboard
- Application: Log AI call counts, Firestore operation counts

**Risk mitigation**:
- Firestore: Implement client-side caching, batch reads where possible
- Vertex AI: Cache common prompts if possible, implement request queuing if needed
- User limits: Optional (not required for MVP)

---

## Implementation Phases

### Phase 1: Foundation (Setup)
- Next.js project setup, TypeScript config
- Firebase project creation, Firestore initialization
- Vertex AI SDK setup, Service Account configuration
- Basic project structure (folders, types)

**Done criteria**: Project runs locally, Firebase connection works, Vertex AI client initializes.

---

### Phase 2: Data Layer
- Firestore collections setup, Security Rules (MVP open)
- TypeScript types for entities (SkillGoal, SkillStep, Submission, Review)
- Firestore helper functions (create, read, update)
- Zod schemas for validation

**Done criteria**: Can create/read goals and steps in Firestore via helper functions, types are correct.

---

### Phase 3: AI Integration
- Vertex AI client setup, Gemini 1.5 Flash model
- Step generation prompt with JSON schema strict
- Review generation prompt with JSON schema strict
- Zod validation for AI responses, retry logic

**Done criteria**: Can generate 5 steps and 1 review via API, responses are valid JSON, validation works.

---

### Phase 4: API Routes
- `/api/skill/generate` route handler
- `/api/skill/review` route handler
- Error handling, input validation (Zod)
- Firestore integration (save generated steps, reviews)

**Done criteria**: API routes accept requests, validate input, call AI, save to Firestore, return responses.

---

### Phase 5: UI - Goal Creation
- `/skill/new` page (Server Component)
- `GoalForm` component (skill type select, goal text input)
- Form submission to `/api/skill/generate`
- Redirect to step list page after creation

**Done criteria**: User can create goal, see 5 steps generated, redirected to step list.

---

### Phase 6: UI - Step List
- `/skill/[goalId]` page (Server Component)
- `StepList` component (fetch steps from Firestore)
- `StepCard` components (display step title, completion status)
- Link to step detail page

**Done criteria**: User sees all 5 steps for a goal, can click to view details.

---

### Phase 7: UI - Step Detail & Submission
- `/skill/[goalId]/steps/[stepId]` page (Server Component)
- `StepDetail` component (task, deliverable display)
- `SubmissionForm` component (code/URL input, submit button)
- Save submission to Firestore on submit

**Done criteria**: User can view step details, submit work (code/URL), see submission saved.

---

### Phase 8: UI - Review Generation & Display
- Review trigger (button on step detail page or automatic)
- Call `/api/skill/review` on trigger
- `ReviewDisplay` component (Keep/Problem/Try/Next sections)
- Save review to Firestore

**Done criteria**: User can trigger review, see structured feedback, review is saved.

---

### Phase 9: UI - Step Completion
- Completion checkbox on step detail page
- Update `done` field in Firestore on toggle
- Reflect completion status in step list page

**Done criteria**: User can mark step complete, status persists, list page shows completion.

---

### Phase 10: Polish & Testing
- Error handling improvements (user-friendly messages)
- Loading states (spinners, disabled buttons)
- Basic styling (Tailwind CSS or similar)
- Manual testing of all 4 user flows
- Fix critical bugs

**Done criteria**: All user flows work end-to-end, errors are handled gracefully, MVP is deployable.

---

## Risks & Mitigations

### Risk 1: AI Response Invalid JSON
**Impact**: High — Blocks step generation and review  
**Mitigation**: 
- JSON schema strict mode in Vertex AI
- Zod validation with retry (1 attempt)
- User message: "再生成してください"

### Risk 2: Firestore Quota Exceeded
**Impact**: Medium — Blocks data persistence  
**Mitigation**: 
- Monitor usage in Firebase Console
- Implement client-side caching
- Batch operations where possible

### Risk 3: Vertex AI Rate Limits
**Impact**: Medium — Blocks AI features  
**Mitigation**: 
- Monitor token usage in Cloud Console
- Implement request queuing if needed
- User message on rate limit error

### Risk 4: Security Rules Too Permissive (MVP)
**Impact**: Low for MVP, High for production  
**Mitigation**: 
- Document MVP rules are development-only
- Plan authentication migration in Phase 11 (post-MVP)

### Risk 5: Cost Overruns
**Impact**: Medium — Unexpected billing  
**Mitigation**: 
- Set up billing alerts in GCP
- Monitor Firestore and Vertex AI usage daily
- Implement user limits if needed

---

## Open Questions Resolved

- ✅ **Storage choice**: Firestore (not localStorage) for persistence
- ✅ **AI service**: Vertex AI Gemini (not OpenAI) for Google integration
- ✅ **Authentication**: Optional for MVP, required for production
- ✅ **Deployment**: Vercel for Next.js, Firebase/GCP for backend services
- ✅ **Testing**: Manual for MVP, automated for critical paths

---

## Next Steps

1. Proceed to Phase 1: Design & Contracts (data-model.md, contracts/, quickstart.md)
2. Create Firestore collections structure
3. Design API contracts (OpenAPI specs)
4. Write quickstart guide for local development
