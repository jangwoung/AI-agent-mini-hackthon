<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0
Modified principles: N/A (initial adoption from .cursor)
Added sections: All (Core Principles, Additional Constraints, Development Workflow, Governance)
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ Constitution Check remains; gates derived from principles
  - .specify/templates/spec-template.md: ✅ No mandatory section changes
  - .specify/templates/tasks-template.md: ✅ Task types (testing, security, perf) already aligned
  - .cursor/commands/*.md: ✅ No CLAUDE-specific references; constitution path unchanged
Follow-up TODOs: None
-->

# AI-agent-mini Constitution

## Core Principles

### I. Readability & Maintainability

Code MUST be readable and maintainable. Use meaningful variable and function names. Keep
functions small (<50 lines) and files focused (<800 lines). Avoid deep nesting (>4 levels).
Rationale: ensures long-term maintainability and easier onboarding.

### II. Security-First

Security is paramount. MUST NOT hardcode secrets (API keys, passwords, tokens); use
environment variables. All user input MUST be validated. Use parameterized queries
(SQL injection mitigation), sanitize output (XSS mitigation), and enable CSRF protection.
Use the **security-reviewer** agent when issues are found. Rationale: security is
non-negotiable per project rules.

### III. Test-First (TDD) — NON-NEGOTIABLE

TDD is mandatory. Workflow: write tests first → run (expect fail) → implement minimal
code → run (expect pass) → refactor. Minimum 80% test coverage; 100% for critical
features. Require unit, integration, and E2E tests (e.g. Playwright for key flows).
Rationale: testable code and consistent quality.

### IV. Immutability & Code Quality

Prefer immutability; avoid in-place mutations. Handle errors comprehensively. Validate
inputs (e.g. Zod). Aim for high cohesion, low coupling. Typical file size 200–400 lines,
max 800. Rationale: fewer bugs and predictable behavior.

### V. Development Workflow & Agent Orchestration

Plan before implementing: use **planner** for complex features. Use **tdd-guide** for
new features and bug fixes. Run **code-reviewer** after writing code. Use **architect**
for architecture decisions. Use conventional commits and small, focused commits. Code
review MUST run before opening a PR. Rationale: consistent process and quality gates.

## Additional Constraints

- **Security checklist** (pre-commit): no hardcoded secrets; all input validated;
  parameterized queries; XSS/CSRF addressed; authz confirmed; rate limiting on
  endpoints; errors must not leak sensitive data.
- **Performance**: consider algorithm complexity; avoid unnecessary re-renders
  (React); use memoization where appropriate; optimize DB queries and caching;
  minimize bundle size (code-splitting, dynamic imports, trim dependencies).
- **File organization**: structure by feature/domain, not by type; 200–400 lines
  typical per file, max 800; extract utilities from large components.

## Development Workflow

- **Git**: conventional commit format (`<type>: <description>`); types include
  `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`. Prefer small
  commits. PR workflow: analyze full diff, write PR summary, include test plan.
- **Agents**: use **planner** for complex work; **tdd-guide** for TDD; **code-reviewer**
  after coding; **architect** for design; **security-reviewer** before commit when
  security concerns exist.
- **Quality gates**: code review before PR; address CRITICAL and HIGH findings;
  fix MEDIUM where feasible; verify 80%+ coverage (100% for critical paths).

## Governance

This constitution supersedes conflicting local practices. Amendments require
documentation, explicit version bump (semver), and inclusion in the Sync Impact
Report. All PRs and reviews MUST verify compliance with these principles.
Complexity beyond the constraints above MUST be justified and documented.

Use **`.cursorrules`** and **`.cursor/`** (rules, agents, commands) for runtime
development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-01-25 | **Last Amended**: 2025-01-25
