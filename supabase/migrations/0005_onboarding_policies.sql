-- Allow authenticated users to create couples and memberships
create policy if not exists "Users can create couples" on couples
  for insert with check (auth.uid() is not null);

create policy if not exists "Users can create own membership" on couple_members
  for insert with check (auth.uid() = user_id);

-- Ensure write access for couple-based tables
create policy if not exists "Insert budgets for couple" on budgets
  for insert with check (is_member_of(couple_id));
create policy if not exists "Update budgets for couple" on budgets
  for update using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create policy if not exists "Insert goals for couple" on goals
  for insert with check (is_member_of(couple_id));
create policy if not exists "Update goals for couple" on goals
  for update using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create policy if not exists "Insert uploads for couple" on uploads
  for insert with check (is_member_of(couple_id));
create policy if not exists "Update uploads for couple" on uploads
  for update using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create policy if not exists "Insert audit logs for couple" on audit_logs
  for insert with check (is_member_of(couple_id));

-- Add upload_id to transactions for traceability
alter table transactions add column if not exists upload_id uuid references uploads(id) on delete set null;
create index if not exists idx_transactions_upload_id on transactions(upload_id);

-- Ritual preferences table
create table if not exists ritual_preferences (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  weekly_day text not null,
  weekly_time text not null,
  reminders_enabled boolean not null default true,
  created_at timestamptz default now()
);

alter table ritual_preferences enable row level security;
create policy if not exists "Access ritual preferences" on ritual_preferences
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

-- Consents table
create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  actor_id uuid references auth.users(id),
  ai_automation boolean not null default true,
  consent_version text not null,
  created_at timestamptz default now()
);

alter table consents enable row level security;
create policy if not exists "Access consents" on consents
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

-- Optional unique constraint for budgets per category/month
create unique index if not exists idx_budgets_unique
  on budgets(couple_id, category_id, period);
