# Tasks: AI-Powered Skill Learning Steps MVP

**Input**: Design documents from `/specs/001-skill-steps/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for MVP. Constitution requires TDD for critical paths (AI integration, data persistence), but manual testing is acceptable for MVP scope.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for pages and API routes, `lib/` for shared logic, `components/` for React components
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/e2e/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js project structure with TypeScript in repository root
- [x] T002 [P] Initialize Next.js project with `npx create-next-app@latest` (TypeScript, App Router, ESLint)
- [x] T003 [P] Install dependencies: `firebase-admin`, `@google-cloud/aiplatform`, `zod` via npm
- [x] T004 [P] Create project folder structure: `app/`, `lib/`, `components/`, `tests/` directories
- [x] T005 [P] Configure TypeScript (`tsconfig.json`) with strict mode
- [x] T006 [P] Configure ESLint and Prettier (`.eslintrc.json`, `.prettierrc`)
- [x] T007 Create `.env.local` file template with environment variable placeholders
- [x] T008 Add `.env.local` to `.gitignore`

**Checkpoint**: Project structure exists, dependencies installed, TypeScript compiles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Initialize Firebase Admin SDK in `lib/firebase/config.ts`
- [x] T010 [P] Initialize Vertex AI client in `lib/ai/vertex-ai.ts`
- [x] T011 [P] Create Firestore Security Rules file `firestore.rules` with MVP open rules
- [x] T012 [P] Define TypeScript types for entities in `lib/firebase/types.ts` (SkillGoal, SkillStep, Submission, Review)
- [x] T013 [P] Create Zod validation schemas in `lib/models/schemas.ts` (SkillGoalSchema, SkillStepSchema, SubmissionSchema, ReviewSchema)
- [x] T014 [P] Create model type files: `lib/models/skill-goal.ts`, `lib/models/skill-step.ts`, `lib/models/submission.ts`, `lib/models/review.ts`
- [x] T015 Implement Firestore helper function `createSkillGoal()` in `lib/firebase/firestore.ts`
- [x] T016 Implement Firestore helper function `createSkillSteps()` in `lib/firebase/firestore.ts` (batch write for 5 steps)
- [x] T017 Implement Firestore helper function `getStepsByGoalId()` in `lib/firebase/firestore.ts`
- [x] T018 Implement Firestore helper function `updateStepCompletion()` in `lib/firebase/firestore.ts`
- [x] T019 Implement Firestore helper function `createSubmission()` in `lib/firebase/firestore.ts`
- [x] T020 Implement Firestore helper function `getSubmissionByStepId()` in `lib/firebase/firestore.ts`
- [x] T021 Implement Firestore helper function `createReview()` in `lib/firebase/firestore.ts`
- [x] T022 Implement Firestore helper function `getReviewByStepId()` in `lib/firebase/firestore.ts`
- [x] T023 Create error handling utilities in `lib/utils/errors.ts`
- [x] T024 Create input validation helpers in `lib/utils/validation.ts`

**Checkpoint**: Foundation ready - Firebase and Vertex AI initialized, Firestore helpers work, types and schemas defined. User story implementation can now begin.

---

## Phase 3: AI Integration (Foundational for US1 and US3)

**Purpose**: Vertex AI integration for step generation and review generation

**⚠️ CRITICAL**: Required for User Story 1 (step generation) and User Story 3 (review generation)

- [x] T025 Create step generation prompt with JSON schema strict in `lib/ai/generate-steps.ts`
- [x] T026 Create review generation prompt with JSON schema strict in `lib/ai/generate-review.ts`
- [x] T027 [P] Create Zod schema `StepsResponseSchema` for AI step generation response in `lib/ai/schemas.ts`
- [x] T028 [P] Create Zod schema `ReviewResponseSchema` for AI review generation response in `lib/ai/schemas.ts`
- [x] T029 Implement step generation function `generateSteps()` in `lib/ai/generate-steps.ts` (calls Vertex AI, validates with Zod)
- [x] T030 Implement review generation function `generateReview()` in `lib/ai/generate-review.ts` (calls Vertex AI, validates with Zod)
- [x] T031 Implement retry logic (1 retry on validation failure) in `lib/ai/generate-steps.ts`
- [x] T032 Implement retry logic (1 retry on validation failure) in `lib/ai/generate-review.ts`
- [x] T033 Add user-friendly error messages ("再生成してください") in `lib/ai/generate-steps.ts`
- [x] T034 Add user-friendly error messages ("再生成してください") in `lib/ai/generate-review.ts`

**Checkpoint**: AI integration ready - can generate 5 steps and reviews via Vertex AI, responses validated with Zod, retry logic works.

---

## Phase 4: User Story 1 - Create Skill Goal and Generate Learning Steps (Priority: P1) 🎯 MVP

**Goal**: User creates a skill goal, system generates 5 sequential learning steps, user sees steps in list view

**Independent Test**: Create a skill goal, verify 5 steps are generated with titles, tasks, and deliverables, confirm steps are displayed in a list view. This delivers a complete learning roadmap without requiring submission or review features.

### Implementation for User Story 1

- [x] T035 [US1] Create API route handler `POST /api/skill/generate` in `app/api/skill/generate/route.ts`
- [x] T036 [US1] Add request validation (Zod: `GenerateRequestSchema`) in `app/api/skill/generate/route.ts`
- [x] T037 [US1] Call AI step generation function in `app/api/skill/generate/route.ts`
- [x] T038 [US1] Create goal + 5 steps in Firestore (transaction) in `app/api/skill/generate/route.ts`
- [x] T039 [US1] Return response with goalId and steps in `app/api/skill/generate/route.ts`
- [x] T040 [US1] Add error handling (400, 500) in `app/api/skill/generate/route.ts`
- [x] T041 [US1] Create goal creation page `/skill/new` in `app/(routes)/skill/new/page.tsx` (Server Component)
- [x] T042 [US1] Create `GoalForm` component in `app/components/skill/GoalForm.tsx` (Client Component with form handling)
- [x] T043 [US1] Add skill type select (Next.js/Go/GCP) in `app/components/skill/GoalForm.tsx`
- [x] T044 [US1] Add goal text textarea in `app/components/skill/GoalForm.tsx`
- [x] T045 [US1] Implement form submission (POST to `/api/skill/generate`) in `app/components/skill/GoalForm.tsx`
- [x] T046 [US1] Add loading state during API call in `app/components/skill/GoalForm.tsx`
- [x] T047 [US1] Add error display on API failure in `app/components/skill/GoalForm.tsx`
- [x] T048 [US1] Redirect to `/skill/[goalId]` on success in `app/components/skill/GoalForm.tsx`
- [x] T049 [US1] Create step list page `/skill/[goalId]` in `app/(routes)/skill/[goalId]/page.tsx` (Server Component)
- [x] T050 [US1] Fetch goal by ID from Firestore in `app/(routes)/skill/[goalId]/page.tsx`
- [x] T051 [US1] Fetch steps by goalId from Firestore in `app/(routes)/skill/[goalId]/page.tsx`
- [x] T052 [US1] Create `StepList` component in `app/components/skill/StepList.tsx` (Server Component)
- [x] T053 [US1] Display goal title and skill type in `app/components/skill/StepList.tsx`
- [x] T054 [US1] Create `StepCard` component in `app/components/skill/StepCard.tsx` (Client Component)
- [x] T055 [US1] Display step title and index in `app/components/skill/StepCard.tsx`
- [x] T056 [US1] Show completion status (checked/unchecked) in `app/components/skill/StepCard.tsx`
- [x] T057 [US1] Add link to step detail page in `app/components/skill/StepCard.tsx`
- [x] T058 [US1] Render list of steps in `app/components/skill/StepList.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. User can create goal, see 5 generated steps, view steps in list.

---

## Phase 5: User Story 2 - Submit Work for a Learning Step (Priority: P2)

**Goal**: User opens step detail page, enters submission (code or URL), submits it, submission is saved

**Independent Test**: Open a step detail page, enter submission content (code or URL), submit it, verify the submission is saved and associated with the step. This delivers the ability to track progress even if review is not yet implemented.

### Implementation for User Story 2

- [x] T059 [US2] Create step detail page `/skill/[goalId]/steps/[stepId]` in `app/(routes)/skill/[goalId]/steps/[stepId]/page.tsx` (Server Component)
- [x] T060 [US2] Fetch step by ID from Firestore in `app/(routes)/skill/[goalId]/steps/[stepId]/page.tsx`
- [x] T061 [US2] Fetch submission by stepId (if exists) from Firestore in `app/(routes)/skill/[goalId]/steps/[stepId]/page.tsx`
- [x] T062 [US2] Create `StepDetail` component in `app/components/skill/StepDetail.tsx` (Server Component)
- [x] T063 [US2] Display step title, task, deliverable in `app/components/skill/StepDetail.tsx`
- [x] T064 [US2] Create `SubmissionForm` component in `app/components/skill/SubmissionForm.tsx` (Client Component)
- [x] T065 [US2] Add textarea for code input in `app/components/skill/SubmissionForm.tsx`
- [x] T066 [US2] Add input for URL (or toggle between code/URL) in `app/components/skill/SubmissionForm.tsx`
- [x] T067 [US2] Add submit button in `app/components/skill/SubmissionForm.tsx`
- [x] T068 [US2] Display existing submission (if any) in `app/components/skill/SubmissionForm.tsx`
- [x] T069 [US2] Implement submission save (create/update in Firestore) in `app/components/skill/SubmissionForm.tsx`
- [x] T070 [US2] Show success message after submission save in `app/components/skill/SubmissionForm.tsx`
- [x] T071 [US2] Refresh page to show saved submission in `app/components/skill/SubmissionForm.tsx`
- [x] T072 [US2] Add completion checkbox (client component) in `app/components/skill/StepDetail.tsx`
- [x] T073 [US2] Implement completion checkbox update (calls `updateStepCompletion()` in Firestore) in `app/components/skill/StepDetail.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. User can view step details, submit work (code/URL), see submission saved, toggle completion.

---

## Phase 6: User Story 3 - Receive AI Review for Submitted Work (Priority: P3)

**Goal**: User triggers review, system generates structured feedback (Keep/Problem/Try/Next), review is displayed

**Independent Test**: Submit work for a step, trigger review, verify the system returns structured feedback in Keep/Problem/Try/Next format. This delivers learning guidance even if step completion tracking is not implemented.

### Implementation for User Story 3

- [x] T074 [US3] Create API route handler `POST /api/skill/review` in `app/api/skill/review/route.ts`
- [x] T075 [US3] Add request validation (Zod: `ReviewRequestSchema`) in `app/api/skill/review/route.ts`
- [x] T076 [US3] Verify step and submission exist in `app/api/skill/review/route.ts`
- [x] T077 [US3] Call AI review generation function in `app/api/skill/review/route.ts`
- [x] T078 [US3] Create/update review in Firestore in `app/api/skill/review/route.ts`
- [x] T079 [US3] Return response with review in `app/api/skill/review/route.ts`
- [x] T080 [US3] Add error handling (400, 404, 500) in `app/api/skill/review/route.ts`
- [x] T081 [US3] Fetch review by stepId (if exists) from Firestore in `app/(routes)/skill/[goalId]/steps/[stepId]/page.tsx`
- [x] T082 [US3] Add "Generate Review" button (only if submission exists) in `app/components/skill/SubmissionForm.tsx`
- [x] T083 [US3] Add loading state during review API call in `app/components/skill/SubmissionForm.tsx`
- [x] T084 [US3] Create `ReviewDisplay` component in `app/components/skill/ReviewDisplay.tsx` (Server Component)
- [x] T085 [US3] Display Keep section in `app/components/skill/ReviewDisplay.tsx`
- [x] T086 [US3] Display Problem section in `app/components/skill/ReviewDisplay.tsx`
- [x] T087 [US3] Display Try section in `app/components/skill/ReviewDisplay.tsx`
- [x] T088 [US3] Display Next section in `app/components/skill/ReviewDisplay.tsx`
- [x] T089 [US3] Implement review generation (POST to `/api/skill/review`) in `app/components/skill/SubmissionForm.tsx`
- [x] T090 [US3] Save review to Firestore and display on page in `app/components/skill/SubmissionForm.tsx`
- [x] T091 [US3] Show error if review generation fails in `app/components/skill/SubmissionForm.tsx`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. User can trigger review, see structured feedback (Keep/Problem/Try/Next), review is saved.

---

## Phase 7: User Story 4 - Mark Learning Step as Complete (Priority: P4)

**Goal**: User checks completion checkbox, status is saved, step list view shows completed status

**Independent Test**: Check a step's completion checkbox, verify the status is saved, confirm the step list view shows the completed status. This delivers progress tracking independently of other features.

### Implementation for User Story 4

- [x] T092 [US4] Make completion checkbox functional in `app/components/skill/StepCard.tsx`
- [x] T093 [US4] Update Firestore on toggle (optimistic update) in `app/components/skill/StepCard.tsx`
- [x] T094 [US4] Show loading state during update in `app/components/skill/StepCard.tsx`
- [x] T095 [US4] Ensure completion checkbox updates Firestore in step detail page `app/components/skill/StepDetail.tsx`
- [x] T096 [US4] Ensure status reflects in real-time in `app/components/skill/StepDetail.tsx`
- [x] T097 [US4] Add visual distinction for completed steps (checked or grayed out) in `app/components/skill/StepCard.tsx`
- [x] T098 [US4] Ensure checkbox state synced with Firestore in `app/components/skill/StepCard.tsx`
- [x] T099 [US4] Ensure list page shows updated completion status in `app/components/skill/StepList.tsx`

**Checkpoint**: All user stories should now be independently functional. User can mark step complete/incomplete, status persists, list page shows updated status.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T100 [P] Improve error handling: user-friendly error messages throughout all components
- [x] T101 [P] Add network error handling in API routes and components
- [x] T102 [P] Add AI service error handling with retry UI in `app/components/skill/GoalForm.tsx` and `app/components/skill/SubmissionForm.tsx`
- [x] T103 [P] Add Firestore error handling with user messages in all Firestore operations
- [x] T104 [P] Add loading states: spinners on buttons during API calls in all form components
- [x] T105 [P] Add disabled buttons during operations in all form components
- [ ] T106 [P] Add skeleton loaders for data fetching in `app/(routes)/skill/[goalId]/page.tsx` and `app/(routes)/skill/[goalId]/steps/[stepId]/page.tsx`
- [ ] T107 [P] Install Tailwind CSS (or use CSS modules) for styling
- [ ] T108 [P] Style forms, buttons, cards with Tailwind CSS
- [ ] T109 [P] Add responsive layout for mobile devices
- [x] T110 [P] Manual testing: Test all 4 user flows end-to-end (create goal → submit → review → complete)
- [x] T111 [P] Manual testing: Test error scenarios (AI failure, network error)
- [x] T112 [P] Manual testing: Test edge cases (empty input, long text)
- [x] T113 Fix critical bugs blocking MVP deployment
- [x] T114 Run quickstart.md validation to ensure setup works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **AI Integration (Phase 3)**: Depends on Foundational completion - Required for US1 and US3
- **User Stories (Phase 4-7)**: All depend on Foundational + AI Integration completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3 → P4)
  - Or in parallel if team capacity allows (US2 can start after US1 API route is done, US3 can start after US2 submission is done)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) + AI Integration (Phase 3) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 step detail page structure, but submission is independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) + AI Integration (Phase 3) - Depends on US2 submission, but review is independent
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 step list and detail pages, but completion tracking is independent

### Within Each User Story

- API routes before UI components (backend first)
- Server Components before Client Components (data fetching first)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005, T006 can run in parallel
- **Phase 2**: T010, T011, T012, T013, T014 can run in parallel
- **Phase 3**: T027, T028 can run in parallel
- **Phase 4 (US1)**: T041-T048 (UI components) can run in parallel with T049-T058 (list page) after API route is done
- **Phase 5 (US2)**: T064-T071 (submission form) can run in parallel with T072-T073 (completion checkbox)
- **Phase 6 (US3)**: T081-T091 (review display and generation) can run in parallel
- **Phase 8**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After API route is complete, these UI tasks can run in parallel:
Task: "Create goal creation page /skill/new in app/(routes)/skill/new/page.tsx"
Task: "Create GoalForm component in app/components/skill/GoalForm.tsx"
Task: "Create step list page /skill/[goalId] in app/(routes)/skill/[goalId]/page.tsx"
Task: "Create StepList component in app/components/skill/StepList.tsx"
Task: "Create StepCard component in app/components/skill/StepCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: AI Integration (CRITICAL - required for US1)
4. Complete Phase 4: User Story 1
5. **STOP and VALIDATE**: Test User Story 1 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational + AI Integration → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational + AI Integration together
2. Once Foundation is done:
   - Developer A: User Story 1 (API route + UI)
   - Developer B: User Story 2 (can start after US1 step detail page structure)
   - Developer C: User Story 3 (can start after US2 submission)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Total tasks**: 114
- **Tasks per user story**: US1 (24), US2 (15), US3 (18), US4 (8)
- **Parallel opportunities**: Many setup and polish tasks can run in parallel

---

## Summary

- **Total Task Count**: 114
- **Task Count per User Story**:
  - US1 (P1): 24 tasks
  - US2 (P2): 15 tasks
  - US3 (P3): 18 tasks
  - US4 (P4): 8 tasks
- **Parallel Opportunities**:
  - Phase 1: 5 tasks
  - Phase 2: 5 tasks
  - Phase 3: 2 tasks
  - Phase 4-7: Multiple UI components can be built in parallel after API routes
  - Phase 8: All polish tasks
- **Independent Test Criteria**:
  - US1: Create goal, verify 5 steps generated, see steps in list
  - US2: Open step detail, submit work, verify saved
  - US3: Submit work, trigger review, verify structured feedback
  - US4: Check completion, verify status saved and reflected in list
- **Suggested MVP Scope**: User Story 1 only (24 tasks + setup/foundational tasks)
