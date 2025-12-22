-- Add metadata container for imported transactions
alter table transactions add column if not exists source_meta jsonb;
