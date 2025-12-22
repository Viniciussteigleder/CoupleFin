# Architecture Contract

## Core Domain Types

### Transaction
- Fields: `id`, `user_id`, `date`, `merchant`, `amount`, `amount_cf`, `status`, `category_id`, `account_id`, `confidence`, `source`, `created_at`.
- Status values: `pending`, `confirmed`, `duplicate`.
- Source values: `csv`, `manual`, others as needed.

### Rule
- Fields: `id`, `user_id`, `type`, `keyword`, `category_id`, `apply_past`, `created_at`.
- Current rule type: `contains` (string match on merchant).

### Account
- Fields: `id`, `user_id`, `name`, `kind`, `created_at`.

### Event
- Table: `transaction_events`.
- Fields: `id`, `user_id`, `type`, `entity_id`, `payload_json`, `created_at`.
- Used for audit and product analytics.

### Category (supporting)
- Fields: `id`, `user_id`, `name`, `type`, `icon`, `created_at`.

## Amount Conventions
- `amount` is an absolute value (always positive).
- `amount_cf` is signed cashflow: expenses are negative, income is positive.
- UI should display sign based on `amount_cf` and format as currency.

## Deduplication Principles
- Normalize merchant text (lowercase, remove punctuation, collapse whitespace).
- Compare candidates by:
  - Similar merchant tokens (>= 0.6 overlap).
  - Same `amount_cf` within 0.01.
  - Dates within 2 days.
- Duplicate groups: keep one primary, mark others `duplicate`.
- All decisions should emit events.

## Logging Requirements
- Every mutation emits a `transaction_events` record.
- Required event types (current):
  - `import_csv`, `rule_created`, `rule_applied_past`, `rule_applied_new`.
  - `transaction_confirmed`, `transaction_categorized`, `transaction_marked_duplicate`.
  - `duplicates_merged`, `duplicates_kept`.
  - `ritual_started`, `ritual_completed`.
- `payload_json` should be a small, structured object (no secrets).

## RLS Expectations
- RLS is enabled on all core tables.
- Policies enforce `auth.uid() = user_id` for select/insert/update/delete.
- Client-side code uses the Supabase anon key; never use service role in the browser.
- Server-side actions must use the authenticated session (cookies).
