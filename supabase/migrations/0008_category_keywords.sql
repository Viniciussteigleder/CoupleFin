-- Keyword rules for auto-categorization
create table if not exists category_keywords (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  category_i text not null,
  category_ii text,
  keywords text[] not null,
  created_at timestamptz default now()
);

alter table category_keywords enable row level security;
create policy if not exists "Access category keywords" on category_keywords
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));
