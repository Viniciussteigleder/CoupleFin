# PRODUCT

## Vision
- TBD

## Target users
- TBD

## Core jobs-to-be-done
- TBD

## MVP (Vertical slices)
- Slice 1: Login → Dashboard → Import CSV → Transactions List

## Non-goals (for now)
- TBD

## Current build status
- **Implemented**
  - Login flows are live under `src/app/(auth)/login/page.tsx` and `src/components/auth/AuthForm.tsx` with Supabase auth.
  - Dashboard (`src/app/(app)/dashboard/page.tsx`) and transactions list (`src/app/(app)/transactions/page.tsx`) already read from `useAppStore`.
  - Import CSV flow exists end-to-end: parser (`src/lib/csv/parseTransactionsCsv.ts`), UI (`src/app/(app)/import/page.tsx`), API (`src/app/api/transactions/import/route.ts`), and store refresh (`src/lib/data/importTransactions.ts`).
- **Partial**
  - Copy centralization is minimal via `copy/pt.json` + `src/lib/i18n/t.ts`, currently applied only to the import page.
  - Playwright smoke coverage exists but does not assert Supabase success (see `e2e/import-smoke.spec.ts`).
- **Missing**
  - Design exports in `design/stitch_export/` remain placeholders.
  - Additional localization wiring for other screens (dashboard/transactions) is still inline text.

## Top 5 issues
1. Import smoke test cannot assert successful inserts without a configured Supabase session and sample layout.
2. Import page still relies on inline error strings returned from the parser; UX needs clearer guidance.
3. Design assets for Slice 1 screens are missing from `design/stitch_export/`.
4. Copy is centralized only for `/import`; other screens still use inline strings.
5. No automation to keep `copy/pt.json` and any future i18n bundles in sync.

## Next 5 smallest tasks
1. Add Stitch PNG/HTML exports for login/dashboard/import/transactions and update `design/stitch-map.json` references.
2. Expand `t()` usage to dashboard/transactions headings and empty/error messages.
3. Make the import success summary actionable with a CTA to `/transactions` and a count of inserted rows.
4. Add a Playwright env fixture (or mock) so the smoke test can assert success reliably.
5. Write a tiny doc or script for keeping `copy/pt.json` and other locale bundles consistent.
