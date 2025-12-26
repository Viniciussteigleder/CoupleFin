# Agent Playbook

## When to use each agent
- **Master Agent**: orchestrates the overall plan, confirms constraints, and owns final delivery.
- **Repo Auditor**: inspects routes, store/data wiring, and migrations to build a factual integration map.
- **UI Agent**: implements routes and UI state transitions with minimal diffs.
- **Data Agent**: wires Supabase calls, validates schema usage, and updates store refresh logic.
- **QA Agent**: adds smoke tests/checklists and verifies basic flows.
- **Code Review Agent**: checks for regressions, missing tests, and unsafe assumptions.
- **DevOps Agent**: ensures CI/CD tasks and environment expectations are met.

## Standard workflow
1. Repo Auditor → inventory and integration points.
2. Product/Spec → validate the Slice contract (SCREENS/JOURNEY).
3. UI + Data → implement minimal changes.
4. QA → add smoke coverage.
5. Review → catch regressions and update docs.

## Anti-loop & cost control
- Max 2 attempts per failing step. If still failing, stop and propose 2 options.
- Prefer targeted reads over full repo scans.
- Keep diffs small: add files rather than refactoring existing ones.

## Short prompt templates
- **Master Agent**
  - “Follow AGENTS.md; audit routing + store; implement Slice 1 with minimal changes; update docs and QA.”
- **Repo Auditor**
  - “List routes, store actions, Supabase client paths, and migrations relevant to Slice 1; include file paths.”
- **UI Agent**
  - “Implement `/import` and CTA in dashboard; keep styles consistent; no refactors.”
- **Data Agent**
  - “Use existing import API; wire store refresh; confirm tables/columns in migrations.”
- **QA Agent**
  - “Add minimal smoke test; update QA_SMOKE; run lint/typecheck.”
- **Code Review Agent**
  - “Identify regressions, missing tests, and edge cases; provide file/line notes.”
- **DevOps Agent**
  - “Confirm environment variables, build/test scripts, and CI expectations.”

## Context hygiene
- Update docs after every change: `docs/PRODUCT.md`, `docs/SCREENS.md`, `docs/JOURNEY.md`, `docs/ARCHITECTURE.md`.
- Avoid re-scanning the repo if the integration map is already captured.
