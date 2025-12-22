# Couple Budget Coach

MVP v0.1 for a couple-focused budgeting coach. Built with Next.js App Router, Tailwind, shadcn/ui, Supabase, and Playwright.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can also copy `.env.example` and fill in values:

```bash
cp .env.example .env.local
```

### Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000` if omitted)

Run the app:

```bash
npm run dev
```

## Supabase

### Migrations

SQL migrations live in `supabase/migrations`. Apply them using the Supabase CLI:

```bash
supabase db push
```

Or run the SQL in the Supabase SQL editor.

### Seed data

Edit `supabase/seed.sql` and replace `YOUR_USER_ID_HERE` with a real `auth.users` id, then run the SQL in the Supabase SQL editor.

## Tests

Playwright smoke tests:

```bash
npm run test:e2e
```

## Deploy (Vercel)

1. Import the repo into Vercel.
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Build command: `npm run build`
4. Output: `.next`

## Branch flow

Use small feature branches off `dev`, open PRs to `dev`, then PR `dev` into `main`.
See `PROJECT_BOARD.md` and `BRANCHING_RULES.md` for the full list of branches and rules.
