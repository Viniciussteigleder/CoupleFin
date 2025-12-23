-- Migration 0009: tighten events RLS + couple linkage

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_couple_id_fkey'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_couple_id_fkey
      FOREIGN KEY (couple_id)
      REFERENCES couples(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their couple's events" ON events;
DROP POLICY IF EXISTS "Users can view their couple's event instances" ON event_instances;

CREATE POLICY IF NOT EXISTS "Access events for couple" ON events
  FOR ALL USING (is_member_of(couple_id))
  WITH CHECK (is_member_of(couple_id));

ALTER TABLE event_instances
  ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;

UPDATE event_instances
SET couple_id = events.couple_id
FROM events
WHERE event_instances.event_id = events.id
  AND event_instances.couple_id IS NULL;

CREATE POLICY IF NOT EXISTS "Access event instances for couple" ON event_instances
  FOR ALL USING (is_member_of(couple_id))
  WITH CHECK (is_member_of(couple_id));
