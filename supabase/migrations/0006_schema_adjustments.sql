-- Add missing columns for UI metadata
alter table categories add column if not exists color text;
alter table accounts add column if not exists last4 text;

-- Tighten events access to couple membership
drop policy if exists "Users can view their couple's events" on events;
drop policy if exists "Users can view their couple's event instances" on event_instances;

create policy if not exists "Access events for couple" on events
  for all using (is_member_of(couple_id)) with check (is_member_of(couple_id));

create policy if not exists "Access event_instances for couple" on event_instances
  for all using (
    exists (
      select 1 from events e
      where e.id = event_instances.event_id
        and is_member_of(e.couple_id)
    )
  )
  with check (
    exists (
      select 1 from events e
      where e.id = event_instances.event_id
        and is_member_of(e.couple_id)
    )
  );
