# ARCHITECTURE

## Stack
- Framework: Next.js App Router (Next 14) with `src/app` layouts and route groups.
- UI: Tailwind + Radix/VA components under `src/components/ui`.
- State: Zustand store in `src/lib/store/useAppStore.ts`.
- Data: Supabase client factories in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`.
- CSV parsing: Papaparse wrapper in `src/lib/csv/parseTransactionsCsv.ts`.

## Module map
- Routing:
  - Login: `src/app/(auth)/login/page.tsx`.
  - Dashboard: `src/app/(app)/dashboard/page.tsx`.
  - Import: `src/app/(app)/import/page.tsx`.
  - Transactions: `src/app/(app)/transactions/page.tsx`.
- Auth: `src/components/auth/AuthForm.tsx` and `src/app/(auth)/callback/route.ts`.
- Import pipeline:
  - UI → `src/app/(app)/import/page.tsx` → helper `src/lib/data/importTransactions.ts` → API `src/app/api/transactions/import/route.ts` → Supabase `transactions` table.
- Store refresh:
  - `useAppStore.fetchData()` in `src/lib/store/useAppStore.ts` is called after import to refresh transactions.
- Copy:
  - `copy/pt.json` is the source of localized strings, accessed via `src/lib/i18n/t.ts`.

## Supabase schema (relevant to Slice 1)
- Core table: `transactions` (created in `supabase/migrations/0001_init.sql`, extended in `0003_mvp_schema.sql` and `0011_csv_ingestion_tables.sql`).
- CSV ingestion tables: `csv_layouts`, `{mm|amex|other}_raw_transactions`, `{mm|amex|other}_clean_transactions`, `uploads`.
- RLS policies: couple-based access in `0003_mvp_schema.sql` and CSV policies in `0011_csv_ingestion_tables.sql`.

## Environment & secrets
- `.env.example` and `.env.local` must define:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ADR index
- See `docs/ADR/`
