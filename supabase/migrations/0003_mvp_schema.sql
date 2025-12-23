-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'active'
);
-- Create couple_members table (linking users to couples)
CREATE TABLE IF NOT EXISTS couple_members (
    couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (couple_id, user_id)
);
-- Enable RLS on new tables
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;
-- RLS for couple_members: Users can see memberships for themselves
CREATE POLICY "Users can view their own memberships" ON couple_members FOR
SELECT USING (auth.uid() = user_id);
-- RLS for couples: Users can view couples they are members of
CREATE POLICY "Users can view their couples" ON couples FOR
SELECT USING (
        id IN (
            SELECT couple_id
            FROM couple_members
            WHERE user_id = auth.uid()
        )
    );
-- Helper function to check if user belongs to couple
CREATE OR REPLACE FUNCTION is_member_of(_couple_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM couple_members
        WHERE couple_id = _couple_id
            AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Update existing tables to include couple_id
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE rules
ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id) ON DELETE CASCADE;
-- Create Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    period TEXT DEFAULT 'monthly' -- monthly, weekly
);
-- Create Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    deadline DATE,
    icon TEXT
);
-- Create Uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    -- pending, processed, error
    metadata JSONB
);
-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB
);
-- Enable RLS on new tables
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Generic RLS policies for couple-based tables
-- Budgets
CREATE POLICY "Access budgets for couple" ON budgets FOR ALL USING (is_member_of(couple_id));
-- Goals
CREATE POLICY "Access goals for couple" ON goals FOR ALL USING (is_member_of(couple_id));
-- Uploads
CREATE POLICY "Access uploads for couple" ON uploads FOR ALL USING (is_member_of(couple_id));
-- Audit Logs
CREATE POLICY "Access audit_logs for couple" ON audit_logs FOR
SELECT USING (is_member_of(couple_id));
-- Update RLS for existing tables (this is tricky because we need to migrate existing data or allow nullable couple_id temporarily)
-- For MVP, we assume new clean slate or we would need migration script.
-- We will add policies that allow access if 'couple_id' is set and user is member.
-- If 'couple_id' is null (legacy personal), we might keep old User ID policy or migrate it.
-- Let's assume we maintain the old 'user_id' based policy for legacy compatibility or simpler:
-- WE ADD NEW policies for couple access.
CREATE POLICY "Access categories for couple" ON categories FOR ALL USING (
    couple_id IS NOT NULL
    AND is_member_of(couple_id)
);
CREATE POLICY "Access accounts for couple" ON accounts FOR ALL USING (
    couple_id IS NOT NULL
    AND is_member_of(couple_id)
);
CREATE POLICY "Access transactions for couple" ON transactions FOR ALL USING (
    couple_id IS NOT NULL
    AND is_member_of(couple_id)
);
CREATE POLICY "Access rules for couple" ON rules FOR ALL USING (
    couple_id IS NOT NULL
    AND is_member_of(couple_id)
);
-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_transactions_couple_date ON transactions(couple_id, date);
CREATE INDEX IF NOT EXISTS idx_receipts_couple ON uploads(couple_id);