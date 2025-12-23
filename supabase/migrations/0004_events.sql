-- Migration 0004: Events & Compromissos
-- This migration adds support for recurring and planned financial events.

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL, -- Reference to couple
  name TEXT NOT NULL,
  amount DECIMAL(10,2),
  type TEXT CHECK (type IN ('recurring', 'planned')),
  frequency TEXT, -- 'monthly', 'weekly', 'yearly', 'once'
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE,
  description TEXT,
  category_id TEXT, -- References category identifier
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'skipped', 'overdue')),
  transaction_id UUID, -- Link to actual transaction when paid
  amount_actual DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_instances ENABLE ROW LEVEL SECURITY;

-- Note: In a real app, these would check couple membership.
-- For now, we allow reading if authenticated or simple true for MVP mock.
CREATE POLICY "Users can view their couple's events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can view their couple's event instances" ON event_instances
  FOR SELECT USING (true);
