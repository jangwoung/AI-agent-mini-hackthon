# Feature Specification: AI-Powered Skill Learning Steps MVP

**Feature Branch**: `001-skill-steps`  
**Created**: 2025-01-25  
**Status**: Draft  
**Input**: User description: "@docs/prd-mvp.md この内容で設定してください。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Skill Goal and Generate Learning Steps (Priority: P1)

A user wants to learn a new technology skill (Next.js, Go, or GCP) and needs a structured learning path. The user selects a technology type, enters a learning goal in plain language, and the system generates 5 sequential learning steps with specific tasks and deliverables.

**Why this priority**: This is the core MVP functionality. Without step generation, users cannot proceed with learning. It delivers immediate value by providing a structured learning path.

**Independent Test**: Can be fully tested by creating a skill goal, verifying 5 steps are generated with titles, tasks, and deliverables, and confirming steps are displayed in a list view. This delivers a complete learning roadmap without requiring submission or review features.

**Acceptance Scenarios**:

1. **Given** a user is on the skill goal creation page, **When** they select "Next.js" as skill type and enter "Create a CRUD app" as goal text, **Then** the system generates exactly 5 sequential steps with titles, tasks, and deliverables, and displays them in a list view.
2. **Given** a user has created a skill goal, **When** they view the step list page, **Then** all 5 steps are displayed as cards with their titles and completion status.
3. **Given** a user selects a different skill type (Go or GCP), **When** they enter a goal, **Then** the generated steps are appropriate for that technology stack.

---

### User Story 2 - Submit Work for a Learning Step (Priority: P2)

A user has completed a learning step task and wants to submit their work (code or URL) for review. The user opens a step detail page, enters their submission (code text or URL), and submits it.

**Why this priority**: Submission is required before review can occur. While step generation (P1) provides value alone, submission enables the feedback loop that makes learning effective.

**Independent Test**: Can be fully tested by opening a step detail page, entering submission content (code or URL), submitting it, and verifying the submission is saved and associated with the step. This delivers the ability to track progress even if review is not yet implemented.

**Acceptance Scenarios**:

1. **Given** a user is viewing a step detail page, **When** they enter code text in the submission field and submit, **Then** the submission is saved and associated with that step.
2. **Given** a user is viewing a step detail page, **When** they enter a URL in the submission field and submit, **Then** the submission is saved and associated with that step.
3. **Given** a user has submitted work for a step, **When** they return to the step detail page, **Then** their previous submission is displayed.

---

### User Story 3 - Receive AI Review for Submitted Work (Priority: P3)

A user has submitted work for a learning step and wants feedback. The user triggers a review, and the system provides structured feedback in four categories: Keep (what's good), Problem (what needs improvement), Try (suggestions), and Next (next steps).

**Why this priority**: Review provides the learning value by giving actionable feedback. However, users can still track progress and complete steps manually without reviews, so this is P3.

**Independent Test**: Can be fully tested by submitting work for a step, triggering review, and verifying the system returns structured feedback in Keep/Problem/Try/Next format. This delivers learning guidance even if step completion tracking is not implemented.

**Acceptance Scenarios**:

1. **Given** a user has submitted work for a step, **When** they trigger a review, **Then** the system displays feedback with Keep, Problem, Try, and Next sections.
2. **Given** a user views a step detail page with an existing review, **When** they open the review section, **Then** all four feedback categories are displayed clearly.
3. **Given** a user submits work and triggers review, **When** the review is generated, **Then** the feedback is in Japanese and specific to the submitted work.

---

### User Story 4 - Mark Learning Step as Complete (Priority: P4)

A user has reviewed feedback and wants to mark a step as complete. The user checks a completion checkbox, and the system saves this status and reflects it in the step list view.

**Why this priority**: Completion tracking helps users see progress, but the core learning value comes from steps and reviews. This is a nice-to-have that enhances the experience.

**Independent Test**: Can be fully tested by checking a step's completion checkbox, verifying the status is saved, and confirming the step list view shows the completed status. This delivers progress tracking independently of other features.

**Acceptance Scenarios**:

1. **Given** a user is viewing a step detail page, **When** they check the completion checkbox, **Then** the step is marked as done and the status is saved.
2. **Given** a user has marked a step as complete, **When** they view the step list page, **Then** the completed step is visually distinguished (e.g., checked or grayed out).
3. **Given** a user unchecks a previously completed step, **When** they save, **Then** the step status is updated to incomplete.

---

### Edge Cases

- What happens when AI step generation fails or returns invalid data?
- How does the system handle empty or invalid goal text input?
- What happens when a user submits empty or extremely long submission content?
- How does the system handle AI review generation failures?
- What happens when a user tries to submit work for a step that doesn't exist?
- How does the system handle concurrent submissions for the same step?
- What happens when localStorage is full or unavailable?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select a skill type from predefined options (Next.js, Go, GCP).
- **FR-002**: System MUST allow users to enter a learning goal as free-form text.
- **FR-003**: System MUST generate exactly 5 sequential learning steps when a goal is created.
- **FR-004**: Each generated step MUST include: title, task description, and deliverable criteria.
- **FR-005**: System MUST display all steps for a goal in a list view with completion status.
- **FR-006**: System MUST allow users to view step details including task, deliverable, and submission area.
- **FR-007**: System MUST allow users to submit work as either code text or a URL.
- **FR-008**: System MUST save submissions and associate them with the corresponding step.
- **FR-009**: System MUST allow users to trigger AI review generation for submitted work.
- **FR-010**: System MUST generate reviews with four structured feedback categories: Keep, Problem, Try, Next.
- **FR-011**: System MUST display reviews in a readable format on the step detail page.
- **FR-012**: System MUST allow users to mark steps as complete or incomplete.
- **FR-013**: System MUST persist step completion status and reflect it in list views.
- **FR-014**: System MUST persist all data (goals, steps, submissions, reviews) across browser sessions.
- **FR-015**: System MUST handle AI service failures gracefully with user-friendly error messages.

### Key Entities *(include if feature involves data)*

- **SkillGoal**: Represents a learning objective. Contains: unique identifier, skill type (Next.js/Go/GCP), goal text, creation timestamp. Related to multiple SkillSteps.
- **SkillStep**: Represents one step in a learning path. Contains: unique identifier, parent goal identifier, sequential index (1-5), title, task description, deliverable criteria, completion status. Related to one SkillGoal, zero or one Submission, zero or one Review.
- **Submission**: Represents user-submitted work for a step. Contains: step identifier, content (code text or URL), creation timestamp. Related to one SkillStep.
- **Review**: Represents AI-generated feedback for submitted work. Contains: step identifier, Keep feedback, Problem feedback, Try feedback, Next feedback, creation timestamp. Related to one SkillStep.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a skill goal and see 5 generated steps displayed in under 10 seconds from goal submission.
- **SC-002**: 100% of generated step sets contain exactly 5 steps with all required fields (title, task, deliverable).
- **SC-003**: Users can successfully submit work (code or URL) for any step without errors in under 3 seconds.
- **SC-004**: Users receive AI review feedback within 15 seconds of triggering review for 95% of submissions.
- **SC-005**: 90% of users can complete the full flow (create goal → view steps → submit work → get review → mark complete) without requiring help or encountering blocking errors.
- **SC-006**: Step completion status persists correctly across browser sessions for 100% of completion actions.
- **SC-007**: All user data (goals, steps, submissions, reviews) persists across browser restarts without data loss.

## Dependencies & Assumptions

### Dependencies

- External AI service availability for step generation and review generation
- Browser support for client-side data persistence (localStorage or equivalent)
- Network connectivity for AI service API calls

### Assumptions

- Users have basic familiarity with the selected technology (Next.js, Go, or GCP)
- Users can provide meaningful goal text that describes their learning objective
- AI service can generate appropriate learning steps based on skill type and goal text
- AI service can provide meaningful code review feedback in Japanese
- Users understand the difference between submitting code text versus a URL
- Browser localStorage has sufficient capacity for typical usage patterns
- Users access the system from a single browser/device (no multi-device sync required for MVP)
