# Tasks: 計画の日程表示・自動リスケジュール

**Input**: Design documents from `/specs/002-plan-schedule-reschedule/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD を要求（Constitution）。リスケジュールロジック・日付計算はテスト先行。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/`, `lib/` at repository root (Next.js App Router)
- Paths follow existing 001 structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 002 用の型・ユーティリティ・スキーマ拡張の基盤

- [x] T001 [P] Create `lib/plan/types.ts` with `StepStatus`, `ScheduleResponse`, `DayItem`, `TaskItem` types
- [x] T002 [P] Create `lib/plan/dates.ts` with `getTodayYYYYMMDD()` utility function
- [x] T003 [P] Create `lib/plan/constants.ts` with `MAX_TASKS_PER_DAY = 2` constant
- [x] T004 Extend `lib/firebase/types.ts` with `SkillGoalScheduleFields` and `SkillStepScheduleFields` interfaces
- [x] T005 Extend `lib/models/schemas.ts` with `StepStatusSchema`, `DateYYYYMMDDSchema`, `StepUpdateRequestSchema`, `ScheduleParamsSchema`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: データモデル拡張とコアロジック。すべての User Story が依存する基盤

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Extend `lib/firebase/firestore.ts` to support reading/writing `scheduledDate`, `status`, `estimatedMinutes` on SkillStep
- [x] T007 [P] Extend `lib/firebase/firestore.ts` to support reading/writing `deadline`, `startDate`, `duration` on SkillGoal
- [x] T008 [P] [US2] Create `lib/plan/ensure-schedule.ts` with `ensureSchedule(goalId)` function (initial assignment for unassigned steps)
- [x] T009 [P] [US2] Create `lib/plan/reschedule.ts` with `runReschedule(goalId)` function (move missed/skipped to next available day)
- [x] T010 [P] [US1] Create `lib/plan/build-schedule.ts` with `buildScheduleResponse(goalId, steps)` function (build 14-day schedule response)
- [x] T011 [P] [US3] Create `lib/plan/alerts.ts` with `checkDeadlineOverflow(goal, days)` and `checkDurationOverflow(goal, days)` functions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 日程ビューで計画を確認する (Priority: P1) 🎯 MVP

**Goal**: ユーザーが今日から 14 日分の日付別計画を確認できる。各日に紐づくタスク一覧とステータス（予定・実施済み・未達・スキップ）が表示される。

**Independent Test**: 計画画面を開き、今日から 14 日分の日付が表示され、各日にタスクが紐づいていること、およびタスクごとにステータスが分かることを確認する。これだけで「いつ何をやるか」が把握できる。

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Unit test for `getTodayYYYYMMDD()` in `lib/plan/__tests__/dates.test.ts`
- [ ] T013 [P] [US1] Unit test for `buildScheduleResponse()` in `lib/plan/__tests__/build-schedule.test.ts`
- [ ] T014 [P] [US1] Integration test for `GET /api/skill/[goalId]/schedule` in `app/api/skill/[goalId]/schedule/__tests__/route.test.ts`

### Implementation for User Story 1

- [x] T015 [US1] Implement `GET /api/skill/[goalId]/schedule` route handler in `app/api/skill/[goalId]/schedule/route.ts` (calls ensureSchedule → runReschedule → buildScheduleResponse)
- [x] T016 [US1] Create `app/(routes)/skill/[goalId]/plan/page.tsx` Server Component (fetches schedule, renders ScheduleView)
- [x] T017 [P] [US1] Create `app/components/plan/ScheduleView.tsx` component (renders 14-day vertical list)
- [x] T018 [P] [US1] Create `app/components/plan/DayRow.tsx` component (renders single day with date and tasks)
- [x] T019 [P] [US1] Create `app/components/plan/TaskItem.tsx` component (renders task with status badge)
- [x] T020 [US1] Add validation for `goalId` parameter in schedule route using Zod
- [x] T021 [US1] Add error handling and user-friendly messages in schedule route

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. User can view 14-day schedule with tasks and statuses.

---

## Phase 4: User Story 2 - 未達・スキップ時に自動で繰り越される (Priority: P2)

**Goal**: 予定日を過ぎてもステータスが「予定」のままのタスク、またはユーザーが「スキップ」したタスクが、次の空き日に自動で繰り越される。1 日あたりの上限を超えないよう制御する。

**Independent Test**: 未達タスクを 1 件作り、自動処理の実行後、そのタスクが「今日以降の空いている日」に移動していること、および 1 日の上限を超えて配置されていないことを確認する。

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T022 [P] [US2] Unit test for `ensureSchedule()` in `lib/plan/__tests__/ensure-schedule.test.ts`
- [ ] T023 [P] [US2] Unit test for `runReschedule()` in `lib/plan/__tests__/reschedule.test.ts` (missed task moves to next available day)
- [ ] T024 [P] [US2] Unit test for `runReschedule()` with daily cap enforcement in `lib/plan/__tests__/reschedule.test.ts`
- [ ] T025 [P] [US2] Integration test for Skip → reschedule flow in `app/api/skill/step/[stepId]/__tests__/route.test.ts`

### Implementation for User Story 2

- [ ] T026 [US2] Implement `ensureSchedule(goalId)` in `lib/plan/ensure-schedule.ts` (assigns scheduledDate to unassigned steps, index order, respects daily cap)
- [ ] T027 [US2] Implement `runReschedule(goalId)` in `lib/plan/reschedule.ts` (finds missed/skipped tasks, moves to next available day, respects daily cap)
- [ ] T028 [US2] Extend `PATCH /api/skill/step/[stepId]` route handler in `app/api/skill/step/[stepId]/route.ts` to accept `status` and `scheduledDate` fields
- [ ] T029 [US2] Add reschedule trigger in `PATCH /api/skill/step/[stepId]` when `status: 'skipped'` is set
- [ ] T030 [US2] Update `lib/firebase/firestore.ts` to handle `status` and `scheduledDate` updates on SkillStep
- [ ] T031 [US2] Add `status` and `done` synchronization logic (when `status === 'done'`, set `done = true`)
- [ ] T032 [US2] Add Skip button to `app/components/skill/StepDetail.tsx` (calls PATCH with `status: 'skipped'`)

**Checkpoint**: At this point, User Story 2 should be fully functional. Missed and skipped tasks automatically move to next available day respecting daily cap.

---

## Phase 5: User Story 3 - 期限・期間超過時にアラートが表示される (Priority: P3)

**Goal**: 資格モードで期限を、Skill モードで学習期間を超えてタスクが配置されそうになる場合、ユーザーにアラートが表示される。MVP では警告表示のみ。

**Independent Test**: 期限（または学習期間）を過ぎそうな状態で自動リスケジュールを行い、アラートが表示されることを確認する。

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T033 [P] [US3] Unit test for `checkDeadlineOverflow()` in `lib/plan/__tests__/alerts.test.ts`
- [ ] T034 [P] [US3] Unit test for `checkDurationOverflow()` in `lib/plan/__tests__/alerts.test.ts`
- [ ] T035 [P] [US3] Integration test for alerts in schedule response in `app/api/skill/[goalId]/schedule/__tests__/route.test.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Implement `checkDeadlineOverflow(goal, days)` in `lib/plan/alerts.ts` (checks if any task scheduledDate exceeds deadline)
- [ ] T037 [US3] Implement `checkDurationOverflow(goal, days)` in `lib/plan/alerts.ts` (checks if any task scheduledDate exceeds startDate + duration)
- [ ] T038 [US3] Integrate alert checks into `buildScheduleResponse()` in `lib/plan/build-schedule.ts` (calls alert functions, adds to response)
- [ ] T039 [US3] Add alerts display to `app/components/plan/ScheduleView.tsx` (shows alert banner if alerts array is non-empty)
- [ ] T040 [US3] Extend `lib/firebase/firestore.ts` to support reading `deadline`, `startDate`, `duration` from SkillGoal

**Checkpoint**: At this point, User Story 3 should be complete. Alerts display when deadline or duration would be exceeded.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数の User Story に影響する改善と、既存画面への統合

- [ ] T041 [P] Add `scheduledDate` display to `app/components/skill/StepDetail.tsx`
- [ ] T042 [P] Extend `app/page.tsx` (Home) to show today's tasks and "未達 N 件" badge
- [ ] T043 [P] Add link to plan page from `app/(routes)/skill/[goalId]/page.tsx` (Step list page)
- [ ] T044 [P] Update `lib/models/schemas.ts` to validate `deadline`, `startDate`, `duration` on SkillGoal creation/update
- [ ] T045 [P] Add error handling for edge cases (14 days all full, timezone issues) in `lib/plan/reschedule.ts`
- [ ] T046 [P] Add logging for reschedule operations in `lib/plan/reschedule.ts` and `lib/plan/ensure-schedule.ts`
- [ ] T047 [P] Update documentation in `docs/` with schedule feature usage
- [ ] T048 [P] Run quickstart.md validation steps
- [ ] T049 [P] Add Firestore index for `(goalId, scheduledDate)` if needed (check query patterns)
- [ ] T050 Code cleanup and refactoring (ensure functions <50 lines, files <800 lines)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for Skip button UI integration, but core reschedule logic is independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for alert display in ScheduleView, but alert logic is independent

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core logic (lib/plan) before API routes
- API routes before UI components
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T005) marked [P] can run in parallel
- All Foundational tasks (T006-T011) marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/utilities within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for getTodayYYYYMMDD() in lib/plan/__tests__/dates.test.ts"
Task: "Unit test for buildScheduleResponse() in lib/plan/__tests__/build-schedule.test.ts"
Task: "Integration test for GET /api/skill/[goalId]/schedule in app/api/skill/[goalId]/schedule/__tests__/route.test.ts"

# Launch all UI components for User Story 1 together:
Task: "Create ScheduleView.tsx component in app/components/plan/ScheduleView.tsx"
Task: "Create DayRow.tsx component in app/components/plan/DayRow.tsx"
Task: "Create TaskItem.tsx component in app/components/plan/TaskItem.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Schedule View)
   - Developer B: User Story 2 (Auto Reschedule)
   - Developer C: User Story 3 (Alerts)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **TDD**: Write tests first, ensure they fail, then implement
- **Backward compatibility**: 001 features must continue to work (done field, existing PATCH behavior)
