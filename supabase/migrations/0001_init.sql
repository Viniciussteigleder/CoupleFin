create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('expense', 'income', 'transfer')),
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  kind text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null,
  amount_cf numeric(12, 2) not null,
  merchant text,
  date date not null,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  confidence numeric(5, 2),
  source text not null default 'manual',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null default 'contains',
  keyword text not null,
  category_id uuid references public.categories(id) on delete set null,
  apply_past boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null,
  entity_id uuid,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);
create index if not exists transactions_status_idx on public.transactions (user_id, status);
create index if not exists rules_user_idx on public.rules (user_id, keyword);
create index if not exists events_user_idx on public.transaction_events (user_id, created_at desc);

alter table public.categories enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.rules enable row level security;
alter table public.transaction_events enable row level security;

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

create policy "accounts_select_own" on public.accounts
  for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts
  for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts
  for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts
  for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

create policy "rules_select_own" on public.rules
  for select using (auth.uid() = user_id);
create policy "rules_insert_own" on public.rules
  for insert with check (auth.uid() = user_id);
create policy "rules_update_own" on public.rules
  for update using (auth.uid() = user_id);
create policy "rules_delete_own" on public.rules
  for delete using (auth.uid() = user_id);

create policy "events_select_own" on public.transaction_events
  for select using (auth.uid() = user_id);
create policy "events_insert_own" on public.transaction_events
  for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.transaction_events
  for update using (auth.uid() = user_id);
create policy "events_delete_own" on public.transaction_events
  for delete using (auth.uid() = user_id);
