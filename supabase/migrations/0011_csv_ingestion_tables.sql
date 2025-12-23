-- CSV ingestion tables aligned to MM/Amex sources and consolidated transactions

create table if not exists csv_layouts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  source text not null check (source in ('MM', 'AMEX', 'OTHER')),
  name text not null,
  header_hash text not null,
  mapping jsonb not null,
  parsing jsonb,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create unique index if not exists csv_layouts_unique
  on csv_layouts(couple_id, source, header_hash);

alter table csv_layouts enable row level security;
create policy if not exists "Access csv layouts" on csv_layouts
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

alter table uploads
  add column if not exists source text,
  add column if not exists layout_id uuid references csv_layouts(id) on delete set null;

create table if not exists mm_clean_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  raw_id uuid,
  date date not null,
  merchant text,
  amount numeric(12, 2) not null,
  amount_cf numeric(12, 2) not null,
  currency text,
  source_meta jsonb,
  dedupe_key text not null,
  manual_type text,
  manual_fixed_var text,
  manual_category_i text,
  manual_category_ii text,
  manual_note text
);

create unique index if not exists mm_clean_dedupe_idx
  on mm_clean_transactions(couple_id, dedupe_key);
create index if not exists mm_clean_couple_date_idx
  on mm_clean_transactions(couple_id, date desc);

alter table mm_clean_transactions enable row level security;
create policy if not exists "Access mm_clean_transactions" on mm_clean_transactions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create table if not exists mm_raw_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  layout_id uuid references csv_layouts(id) on delete set null,
  row_index integer,
  raw_row jsonb not null,
  dedupe_key text,
  is_duplicate boolean not null default false,
  clean_id uuid references mm_clean_transactions(id) on delete set null
);

create index if not exists mm_raw_couple_idx on mm_raw_transactions(couple_id);

alter table mm_raw_transactions enable row level security;
create policy if not exists "Access mm_raw_transactions" on mm_raw_transactions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create table if not exists amex_clean_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  raw_id uuid,
  date date not null,
  merchant text,
  amount numeric(12, 2) not null,
  amount_cf numeric(12, 2) not null,
  currency text,
  source_meta jsonb,
  dedupe_key text not null,
  manual_type text,
  manual_fixed_var text,
  manual_category_i text,
  manual_category_ii text,
  manual_note text
);

create unique index if not exists amex_clean_dedupe_idx
  on amex_clean_transactions(couple_id, dedupe_key);
create index if not exists amex_clean_couple_date_idx
  on amex_clean_transactions(couple_id, date desc);

alter table amex_clean_transactions enable row level security;
create policy if not exists "Access amex_clean_transactions" on amex_clean_transactions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create table if not exists amex_raw_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  layout_id uuid references csv_layouts(id) on delete set null,
  row_index integer,
  raw_row jsonb not null,
  dedupe_key text,
  is_duplicate boolean not null default false,
  clean_id uuid references amex_clean_transactions(id) on delete set null
);

create index if not exists amex_raw_couple_idx on amex_raw_transactions(couple_id);

alter table amex_raw_transactions enable row level security;
create policy if not exists "Access amex_raw_transactions" on amex_raw_transactions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create table if not exists other_clean_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  raw_id uuid,
  date date not null,
  merchant text,
  amount numeric(12, 2) not null,
  amount_cf numeric(12, 2) not null,
  currency text,
  source_meta jsonb,
  dedupe_key text not null,
  manual_type text,
  manual_fixed_var text,
  manual_category_i text,
  manual_category_ii text,
  manual_note text
);

create unique index if not exists other_clean_dedupe_idx
  on other_clean_transactions(couple_id, dedupe_key);
create index if not exists other_clean_couple_date_idx
  on other_clean_transactions(couple_id, date desc);

alter table other_clean_transactions enable row level security;
create policy if not exists "Access other_clean_transactions" on other_clean_transactions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create table if not exists other_raw_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples(id) on delete cascade not null,
  upload_id uuid references uploads(id) on delete set null,
  layout_id uuid references csv_layouts(id) on delete set null,
  row_index integer,
  raw_row jsonb not null,
  dedupe_key text,
  is_duplicate boolean not null default false,
  clean_id uuid references other_clean_transactions(id) on delete set null
);

create index if not exists other_raw_couple_idx on other_raw_transactions(couple_id);

alter table other_raw_transactions enable row level security;
create policy if not exists "Access other_raw_transactions" on other_raw_transactions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

alter table transactions
  add column if not exists source_table text,
  add column if not exists source_id uuid;

create index if not exists transactions_source_idx
  on transactions(source_table, source_id);

create table if not exists category_suggestions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  source text,
  merchant text,
  date date,
  amount numeric(12, 2),
  recommended_keyword text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table category_suggestions enable row level security;
create policy if not exists "Access category suggestions" on category_suggestions
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create table if not exists couple_flags (
  couple_id uuid primary key references couples(id) on delete cascade,
  has_completed_onboarding boolean not null default false,
  has_transactions boolean not null default false,
  invite_status text not null default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table couple_flags enable row level security;
create policy if not exists "Access couple flags" on couple_flags
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));
