# SCREENS — Contracts

> Each screen contract must include: purpose, actions, states, data deps, acceptance criteria, next rules.

## Screen list
- Login
- Dashboard
- Import CSV
- Transactions List

## Contracts
### Screen: Login (`/login`)
- Purpose: Authenticate the couple and redirect to `/dashboard`.
- Primary actions: email/password sign-in, Google OAuth.
- Inputs: email, password, OAuth callbacks.
- Outputs: Supabase session, redirect to `/dashboard`.
- States: idle, loading, error, success.
- Data dependencies: Supabase auth; `src/lib/supabase/client.ts`.
- Acceptance criteria:
  - Required fields validated.
  - Auth errors surfaced via toast.
  - Redirect occurs on success.
- Next-screen rules: success → `/dashboard`.
- Implementation mapping: `src/app/(auth)/login/page.tsx`, `src/components/auth/AuthForm.tsx`.

### Screen: Dashboard (`/dashboard`)
- Purpose: Summary of the couple’s finances with a CTA to import.
- Primary actions: view summary, open `/import`, open `/transactions`.
- Inputs: `transactions`, `categories`, `events` from store.
- Outputs: navigation to `/import` and `/transactions`.
- States: loading, empty, success, error.
- Data dependencies: `useAppStore.fetchData()` and Supabase `transactions`.
- Acceptance criteria:
  - CTA “Importar CSV” visible.
  - Empty state prompts CSV import when no transactions.
- Next-screen rules: CTA → `/import`.
- Implementation mapping: `src/app/(app)/dashboard/page.tsx`.

### Screen: Import CSV (`/import`)
- Purpose: Upload CSV, parse rows, preview, and submit import.
- Primary actions: upload file, confirm import, view summary, go to transactions.
- Inputs: CSV file, parsed rows.
- Outputs: POST `/api/transactions/import`, store refresh, summary metrics.
- States: idle, parsing, preview, importing, success, error.
- Data dependencies: `src/lib/csv/parseTransactionsCsv.ts`, `src/lib/data/importTransactions.ts`, `src/app/api/transactions/import/route.ts`.
- Acceptance criteria:
  - Required headers (date, description, amount, currency) enforced.
  - Preview shows up to 20 rows.
  - Confirm button enabled only with valid rows.
  - Import refreshes store and transactions reflect the new rows.
- Next-screen rules: success → `/transactions`.
- Implementation mapping: `src/app/(app)/import/page.tsx`.

### Screen: Transactions List (`/transactions`)
- Purpose: Show imported transactions and allow basic search.
- Primary actions: search/filter, open detail page.
- Inputs: store transactions, categories, accounts.
- Outputs: list rows and details.
- States: loading, empty, success.
- Data dependencies: `useAppStore.transactions` and Supabase `transactions` table.
- Acceptance criteria:
  - Search filters by description/amount.
  - Empty state points to import.
- Next-screen rules: stay on list; CTA → `/import`.
- Implementation mapping: `src/app/(app)/transactions/page.tsx`.
