# Project Board

This board maps long-lived and feature branches to domain ownership. All feature work should branch from `dev`.

## main
- Purpose: Production-ready, always deployable.
- Agent role: Release owner.
- Acceptance criteria: Green CI, no unreviewed merges, tagged release notes.
- Dependencies: `dev`.

## dev
- Purpose: Integration branch for upcoming features.
- Agent role: Integration coordinator.
- Acceptance criteria: All feature branches merged via PR and smoke tests passing.
- Dependencies: `main`.

## feat/auth
- Purpose: Supabase auth flow, session handling, and login UX.
- Agent role: Auth + security.
- Acceptance criteria: OAuth login works for Google/GitHub, middleware gating verified, redirects stable.
- Dependencies: none.

## feat/db-schema
- Purpose: Supabase schema/migrations, seed data, and RLS validation.
- Agent role: Data model owner.
- Acceptance criteria: Migrations align with app queries, RLS policies validated, seed data updated.
- Dependencies: none.

## feat/import-csv
- Purpose: CSV ingestion pipeline and transaction creation.
- Agent role: Data import.
- Acceptance criteria: CSV mapping covers common headers, amount/amount_cf conventions respected, events logged.
- Dependencies: feat/db-schema.

## feat/confirm-queue
- Purpose: Pending transaction review, categorization, and duplicate merge flow.
- Agent role: Transaction ops.
- Acceptance criteria: Confirm/categorize/merge updates Supabase and logs events, dedupe grouping stable.
- Dependencies: feat/db-schema.

## feat/rules-engine
- Purpose: Rule creation and auto-categorization.
- Agent role: Rules + automation.
- Acceptance criteria: Rules CRUD works, apply_past updates transactions, events logged.
- Dependencies: feat/db-schema.

## feat/dashboard
- Purpose: Monthly dashboard stats and insights.
- Agent role: Insights + analytics UI.
- Acceptance criteria: Stats derived from transactions, placeholders replaced with real data.
- Dependencies: feat/db-schema.

## feat/calendar
- Purpose: Cashflow calendar view.
- Agent role: Calendar UX.
- Acceptance criteria: Daily totals use amount_cf, month navigation works, performance acceptable.
- Dependencies: feat/db-schema.

## feat/ritual
- Purpose: Weekly ritual guided flow.
- Agent role: Coaching flow UX.
- Acceptance criteria: Stepper state reliable, completion logged, copy localized.
- Dependencies: feat/db-schema.

## feat/logs-audit
- Purpose: Audit trail exploration and filtering.
- Agent role: Observability + audit.
- Acceptance criteria: Filters/search work, event payload visible, exports available.
- Dependencies: feat/db-schema.

## chore/ui-layout
- Purpose: Shell, navigation, and design system consistency.
- Agent role: UI foundations.
- Acceptance criteria: Layouts responsive, shadcn/tailwind tokens consistent, no data logic changes.
- Dependencies: none.

## chore/dev-infra
- Purpose: CI, linting, testing, and deployment scaffolding.
- Agent role: DevOps.
- Acceptance criteria: CI checks for lint/typecheck/tests, env docs updated, tooling stable.
- Dependencies: none.
