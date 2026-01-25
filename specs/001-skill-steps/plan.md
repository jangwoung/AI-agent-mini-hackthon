# Implementation Plan: AI-Powered Skill Learning Steps MVP

**Branch**: `001-skill-steps` | **Date**: 2025-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-skill-steps/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an MVP web application that helps users learn technology skills (Next.js, Go, GCP) through AI-generated structured learning steps. Users create a learning goal, receive 5 sequential steps, submit work (code/URL), get AI feedback (Keep/Problem/Try/Next), and track completion. Technical approach: Next.js App Router for frontend/API, Firebase Firestore for data persistence, Vertex AI (Gemini) for step generation and code review.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x  
**Primary Dependencies**: Next.js 14+ (App Router), Firebase Admin SDK, @google-cloud/aiplatform (Vertex AI SDK), Zod (validation)  
**Storage**: Firebase Firestore (NoSQL document database)  
**Authentication**: Firebase Authentication (optional for MVP, can be added later)  
**AI Service**: Google Vertex AI (Gemini 1.5 Flash model)  
**Testing**: Jest, React Testing Library, Playwright (E2E)  
**Target Platform**: Web browser (modern browsers), Vercel/Cloud Run deployment  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: 
- Step generation: <10 seconds (SC-001)
- Submission save: <3 seconds (SC-003)
- Review generation: <15 seconds for 95% of requests (SC-004)
- Page load: <2 seconds initial, <500ms navigation  
**Constraints**: 
- MVP scope: 4 pages, localStorage fallback acceptable initially
- AI response must be valid JSON (schema validation required)
- Firestore free tier limits: 50K reads/day, 20K writes/day
- Vertex AI quota: monitor usage, implement retry logic
- No multi-device sync required for MVP  
**Scale/Scope**: 
- Single-user MVP (no multi-tenancy)
- 10-100 goals per user expected
- 5 steps per goal (fixed)
- 1 submission + 1 review per step max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Readability & Maintainability
- ✅ Functions <50 lines, files <800 lines: Enforced via code review
- ✅ Meaningful names: TypeScript types, clear component names
- ✅ Avoid deep nesting: React components, API handlers structured flat

### II. Security-First
- ✅ No hardcoded secrets: Environment variables for Firebase config, Vertex AI credentials
- ✅ Input validation: Zod schemas for all API requests
- ✅ XSS mitigation: Next.js automatic escaping, React safe rendering
- ✅ CSRF: Next.js built-in CSRF protection for API routes
- ⚠️ Authentication: Optional for MVP, but Firestore Security Rules must restrict access

### III. Test-First (TDD) — NON-NEGOTIABLE
- ✅ TDD workflow: Tests written before implementation for critical paths (AI integration, data persistence)
- ✅ Coverage target: 80% minimum, 100% for AI integration and data models
- ✅ Test types: Unit (models, utilities), Integration (API routes), E2E (user flows)

### IV. Immutability & Code Quality
- ✅ Immutability: TypeScript readonly, React state immutability patterns
- ✅ Error handling: Try/catch with user-friendly messages, Zod validation errors
- ✅ Input validation: Zod schemas for all external inputs

### V. Development Workflow & Agent Orchestration
- ✅ Planning: This plan document
- ✅ TDD: Tests for AI integration, data models first
- ✅ Code review: Required before PR
- ✅ Conventional commits: Enforced

**Gate Status**: ✅ PASS — All principles satisfied. Security Rules (MVP open rules) documented in data-model.md. Authentication optional for MVP, production rules prepared.

## Project Structure

### Documentation (this feature)

```text
specs/001-skill-steps/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-skill-generate.yaml
│   └── api-skill-review.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (routes)/
│   ├── skill/
│   │   ├── new/
│   │   │   └── page.tsx              # Skill goal creation page
│   │   ├── [goalId]/
│   │   │   ├── page.tsx              # Step list page
│   │   │   └── steps/
│   │   │       └── [stepId]/
│   │   │           ├── page.tsx      # Step detail page
│   │   │           └── review/
│   │   │               └── page.tsx  # Review trigger page (optional)
│   │   └── layout.tsx                # Shared layout for skill routes
│   └── layout.tsx                    # Root layout
├── api/
│   └── skill/
│       ├── generate/
│       │   └── route.ts              # POST /api/skill/generate
│       └── review/
│           └── route.ts              # POST /api/skill/review
├── components/
│   ├── skill/
│   │   ├── GoalForm.tsx              # Goal creation form
│   │   ├── StepList.tsx              # Step list display
│   │   ├── StepCard.tsx              # Individual step card
│   │   ├── StepDetail.tsx            # Step detail view
│   │   ├── SubmissionForm.tsx        # Submission input form
│   │   └── ReviewDisplay.tsx         # Review display component
│   └── ui/                           # Shared UI components (buttons, inputs, etc.)
├── lib/
│   ├── firebase/
│   │   ├── config.ts                 # Firebase initialization
│   │   ├── firestore.ts              # Firestore client helpers
│   │   └── types.ts                  # Firestore document types
│   ├── ai/
│   │   ├── vertex-ai.ts              # Vertex AI client setup
│   │   ├── generate-steps.ts         # Step generation logic
│   │   ├── generate-review.ts        # Review generation logic
│   │   └── schemas.ts                # Zod schemas for AI responses
│   ├── models/
│   │   ├── skill-goal.ts             # SkillGoal model/type
│   │   ├── skill-step.ts             # SkillStep model/type
│   │   ├── submission.ts             # Submission model/type
│   │   └── review.ts                 # Review model/type
│   └── utils/
│       ├── validation.ts             # Input validation helpers
│       └── errors.ts                 # Error handling utilities
└── types/
    └── index.ts                      # Shared TypeScript types

tests/
├── unit/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── generate-steps.test.ts
│   │   │   └── generate-review.test.ts
│   │   └── models/
│   │       └── *.test.ts
│   └── components/
│       └── skill/
│           └── *.test.tsx
├── integration/
│   └── api/
│       ├── skill/
│       │   ├── generate.test.ts
│       │   └── review.test.ts
└── e2e/
    ├── skill-creation.spec.ts
    ├── step-submission.spec.ts
    └── review-flow.spec.ts
```

**Structure Decision**: Next.js App Router structure with feature-based component organization. API routes in `/app/api`, pages in `/app/(routes)`, shared logic in `/lib`. Tests mirror source structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Structure follows Next.js conventions, components are small and focused, external dependencies (Firebase, Vertex AI) are justified for MVP requirements.

## Implementation Phases

### Phase 1: Foundation (Setup)
**Goal**: Project structure, dependencies, Firebase/Vertex AI initialization

**Tasks**:
- Initialize Next.js project with TypeScript
- Install dependencies (Firebase Admin SDK, Vertex AI SDK, Zod)
- Create project folder structure (`app/`, `lib/`, `components/`, `tests/`)
- Set up environment variables (`.env.local`)
- Initialize Firebase Admin SDK (`lib/firebase/config.ts`)
- Initialize Vertex AI client (`lib/ai/vertex-ai.ts`)
- Configure TypeScript, ESLint, Prettier

**Done Criteria**:
- ✅ Project runs locally (`npm run dev`)
- ✅ Firebase connection works (can read/write to Firestore)
- ✅ Vertex AI client initializes without errors
- ✅ TypeScript compiles without errors

---

### Phase 2: Data Layer
**Goal**: Firestore collections, TypeScript types, validation schemas

**Tasks**:
- Create Firestore Security Rules (MVP open rules)
- Define TypeScript types (`lib/firebase/types.ts`, `lib/models/*.ts`)
- Create Zod validation schemas (`lib/models/schemas.ts`)
- Implement Firestore helper functions:
  - `createSkillGoal()` - Create goal document
  - `createSkillSteps()` - Create 5 step documents (batch)
  - `getStepsByGoalId()` - Query steps by goal
  - `updateStepCompletion()` - Update `done` field
  - `createSubmission()` - Create/update submission
  - `getSubmissionByStepId()` - Query submission by step
  - `createReview()` - Create/update review
  - `getReviewByStepId()` - Query review by step

**Done Criteria**:
- ✅ Can create goal + 5 steps in Firestore via helper functions
- ✅ Can read steps by goalId
- ✅ Can update step completion status
- ✅ Can create/read submission and review
- ✅ All types are correct (TypeScript compiles)
- ✅ Validation schemas catch invalid data

---

### Phase 3: AI Integration
**Goal**: Vertex AI prompts, JSON schema strict, response validation

**Tasks**:
- Create step generation prompt with JSON schema strict (`lib/ai/generate-steps.ts`)
- Create review generation prompt with JSON schema strict (`lib/ai/generate-review.ts`)
- Implement Zod schemas for AI responses (`lib/ai/schemas.ts`):
  - `StepsResponseSchema` - Array of 5 steps
  - `ReviewResponseSchema` - Review with Keep/Problem/Try/Next
- Implement retry logic (1 retry on validation failure)
- Add error handling (user-friendly messages)

**Done Criteria**:
- ✅ Can generate 5 steps via Vertex AI (Gemini 1.5 Flash)
- ✅ Can generate review via Vertex AI
- ✅ AI responses are valid JSON (Zod validation passes)
- ✅ Retry logic works (retries once on failure)
- ✅ Error messages are user-friendly ("再生成してください")

---

### Phase 4: API Routes
**Goal**: `/api/skill/generate` and `/api/skill/review` endpoints

**Tasks**:
- Create `/app/api/skill/generate/route.ts`:
  - Validate request (Zod: `GenerateRequestSchema`)
  - Call AI step generation
  - Create goal + 5 steps in Firestore (transaction)
  - Return response with goalId and steps
  - Handle errors (400, 500)
- Create `/app/api/skill/review/route.ts`:
  - Validate request (Zod: `ReviewRequestSchema`)
  - Verify step and submission exist
  - Call AI review generation
  - Create/update review in Firestore
  - Return response with review
  - Handle errors (400, 404, 500)

**Done Criteria**:
- ✅ `POST /api/skill/generate` accepts valid request, returns goalId + 5 steps
- ✅ `POST /api/skill/review` accepts valid request, returns review
- ✅ Both endpoints validate input (Zod)
- ✅ Both endpoints handle errors gracefully (user-friendly messages)
- ✅ Both endpoints save data to Firestore correctly

---

### Phase 5: UI - Goal Creation
**Goal**: `/skill/new` page, goal creation form

**Tasks**:
- Create `/app/(routes)/skill/new/page.tsx` (Server Component)
- Create `app/components/skill/GoalForm.tsx`:
  - Skill type select (Next.js/Go/GCP)
  - Goal text textarea
  - Submit button
  - Loading state
  - Error display
- Implement form submission:
  - Client component for form handling
  - POST to `/api/skill/generate`
  - Redirect to `/skill/[goalId]` on success
  - Show error on failure

**Done Criteria**:
- ✅ User can select skill type and enter goal text
- ✅ Form submits to API, creates goal + 5 steps
- ✅ Redirects to step list page after creation
- ✅ Shows loading state during API call
- ✅ Shows error message if API fails

---

### Phase 6: UI - Step List
**Goal**: `/skill/[goalId]` page, display all steps

**Tasks**:
- Create `/app/(routes)/skill/[goalId]/page.tsx` (Server Component):
  - Fetch goal by ID from Firestore
  - Fetch steps by goalId from Firestore
  - Pass data to components
- Create `app/components/skill/StepList.tsx` (Server Component):
  - Display goal title and skill type
  - Render list of steps
- Create `app/components/skill/StepCard.tsx` (Client Component):
  - Display step title, index
  - Show completion status (checked/unchecked)
  - Link to step detail page
  - Visual distinction for completed steps

**Done Criteria**:
- ✅ User sees goal title and skill type
- ✅ User sees all 5 steps in list
- ✅ Completed steps are visually distinguished
- ✅ User can click step to view details
- ✅ Page loads steps from Firestore (not API)

---

### Phase 7: UI - Step Detail & Submission
**Goal**: `/skill/[goalId]/steps/[stepId]` page, submission form

**Tasks**:
- Create `/app/(routes)/skill/[goalId]/steps/[stepId]/page.tsx` (Server Component):
  - Fetch step by ID from Firestore
  - Fetch submission by stepId (if exists)
  - Fetch review by stepId (if exists)
  - Pass data to components
- Create `app/components/skill/StepDetail.tsx` (Server Component):
  - Display step title, task, deliverable
  - Display completion checkbox (client component)
- Create `app/components/skill/SubmissionForm.tsx` (Client Component):
  - Textarea for code input
  - Input for URL (or toggle between code/URL)
  - Submit button
  - Display existing submission (if any)
  - POST to Firestore (via API route or direct client write)
- Implement submission save:
  - Create/update submission in Firestore
  - Show success message
  - Refresh page to show saved submission

**Done Criteria**:
- ✅ User can view step details (title, task, deliverable)
- ✅ User can submit work (code or URL)
- ✅ Submission is saved to Firestore
- ✅ Existing submission is displayed if present
- ✅ Completion checkbox works (updates Firestore)

---

### Phase 8: UI - Review Generation & Display
**Goal**: Review trigger, display review feedback

**Tasks**:
- Add review trigger button to step detail page:
  - "Generate Review" button (only if submission exists)
  - Loading state during API call
- Create `app/components/skill/ReviewDisplay.tsx` (Server Component):
  - Display Keep section
  - Display Problem section
  - Display Try section
  - Display Next section
  - Styled layout (cards or sections)
- Implement review generation:
  - POST to `/api/skill/review` with step + submission data
  - Save review to Firestore
  - Display review on page
  - Show error if generation fails

**Done Criteria**:
- ✅ User can trigger review (button appears if submission exists)
- ✅ Review is generated via API
- ✅ Review is displayed with 4 sections (Keep/Problem/Try/Next)
- ✅ Review is saved to Firestore
- ✅ Error handling works (user-friendly message)

---

### Phase 9: UI - Step Completion
**Goal**: Completion checkbox, status persistence

**Tasks**:
- Update `StepCard.tsx`:
  - Make completion checkbox functional
  - Update Firestore on toggle (optimistic update)
  - Show loading state during update
- Update step detail page:
  - Completion checkbox updates Firestore
  - Status reflects in real-time
- Ensure completion status persists:
  - Checkbox state synced with Firestore
  - List page shows updated status

**Done Criteria**:
- ✅ User can mark step complete/incomplete
- ✅ Status updates in Firestore immediately
- ✅ Step list page shows updated completion status
- ✅ Status persists across page refreshes

---

### Phase 10: Polish & Testing
**Goal**: Error handling, loading states, styling, manual testing

**Tasks**:
- Improve error handling:
  - User-friendly error messages throughout
  - Network error handling
  - AI service error handling
  - Firestore error handling
- Add loading states:
  - Spinners on buttons during API calls
  - Disabled buttons during operations
  - Skeleton loaders for data fetching
- Basic styling:
  - Install Tailwind CSS (or use CSS modules)
  - Style forms, buttons, cards
  - Responsive layout
- Manual testing:
  - Test all 4 user flows end-to-end
  - Test error scenarios (AI failure, network error)
  - Test edge cases (empty input, long text)
- Fix critical bugs:
  - Address any blocking issues
  - Ensure MVP is deployable

**Done Criteria**:
- ✅ All user flows work end-to-end (create → submit → review → complete)
- ✅ Errors are handled gracefully (user-friendly messages)
- ✅ Loading states are clear (spinners, disabled buttons)
- ✅ UI is functional and readable (basic styling)
- ✅ No critical bugs blocking MVP deployment

---

## Risk Mitigation Summary

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| AI response invalid JSON | High | JSON schema strict + Zod validation + retry | Phase 3 |
| Firestore quota exceeded | Medium | Monitor usage, caching, batch operations | Phase 2, 10 |
| Vertex AI rate limits | Medium | Monitor usage, request queuing | Phase 3, 10 |
| Security rules too permissive | Low (MVP) | Document MVP-only, plan auth migration | Phase 2 |
| Cost overruns | Medium | Billing alerts, usage monitoring | Phase 10 |

---

## Next Steps

1. ✅ Complete Phase 1: Foundation
2. ✅ Complete Phase 2: Data Layer
3. ✅ Complete Phase 3: AI Integration
4. ✅ Complete Phase 4: API Routes
5. ✅ Complete Phase 5-9: UI Implementation
6. ✅ Complete Phase 10: Polish & Testing
7. Deploy to Vercel
8. Monitor usage and costs
9. Plan Phase 11: Authentication (post-MVP)
