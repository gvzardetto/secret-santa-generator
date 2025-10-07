-- Secret Santa Generator - Database Schema
-- Supabase Project: zardalabs (jkovolickaehfodthnts)
-- Created: 2025-10-07

-- ============================================
-- TABLE: events
-- Stores Secret Santa event information
-- ============================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    exchange_date DATE NOT NULL,
    budget NUMERIC(10,2),
    organizer_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE events IS 'Stores Secret Santa event information';

-- Add comments to columns
COMMENT ON COLUMN events.id IS 'Unique identifier for the event';
COMMENT ON COLUMN events.event_name IS 'Name of the Secret Santa event';
COMMENT ON COLUMN events.exchange_date IS 'Date when gifts will be exchanged';
COMMENT ON COLUMN events.budget IS 'Suggested budget for gifts';
COMMENT ON COLUMN events.organizer_email IS 'Email of the event organizer';
COMMENT ON COLUMN events.created_at IS 'Timestamp when the event was created';

-- ============================================
-- TABLE: participants
-- Stores participant information and assignments
-- ============================================

CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    wish_list TEXT,
    assigned_to_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_participants_event
        FOREIGN KEY (event_id) 
        REFERENCES events(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_participants_assigned_to
        FOREIGN KEY (assigned_to_id) 
        REFERENCES participants(id) 
        ON DELETE SET NULL,
    
    -- Business logic constraints
    CONSTRAINT chk_not_assigned_to_self
        CHECK (id != assigned_to_id),
    
    CONSTRAINT unique_email_per_event
        UNIQUE (event_id, email)
);

-- Add comment to table
COMMENT ON TABLE participants IS 'Stores participant information and Secret Santa assignments';

-- Add comments to columns
COMMENT ON COLUMN participants.id IS 'Unique identifier for the participant';
COMMENT ON COLUMN participants.event_id IS 'Reference to the event this participant belongs to';
COMMENT ON COLUMN participants.name IS 'Full name of the participant';
COMMENT ON COLUMN participants.email IS 'Email address of the participant';
COMMENT ON COLUMN participants.wish_list IS 'Optional wish list or gift preferences';
COMMENT ON COLUMN participants.assigned_to_id IS 'The participant this person is assigned to give a gift to';
COMMENT ON COLUMN participants.created_at IS 'Timestamp when the participant was added';

-- ============================================
-- INDEXES
-- Improve query performance
-- ============================================

-- Index for finding participants by event
CREATE INDEX IF NOT EXISTS idx_participants_event_id 
    ON participants(event_id);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_participants_email 
    ON participants(email);

-- Index for assignment lookups
CREATE INDEX IF NOT EXISTS idx_participants_assigned_to_id 
    ON participants(assigned_to_id);

-- Index for organizer email lookups
CREATE INDEX IF NOT EXISTS idx_events_organizer_email 
    ON events(organizer_email);

-- Index for event date queries
CREATE INDEX IF NOT EXISTS idx_events_exchange_date 
    ON events(exchange_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable security policies
-- ============================================

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on participants table
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create events (for now - adjust based on your needs)
CREATE POLICY "Enable insert for all users" ON events
    FOR INSERT
    WITH CHECK (true);

-- Policy: Anyone can read events (for now - adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON events
    FOR SELECT
    USING (true);

-- Policy: Organizers can update their own events
CREATE POLICY "Enable update for organizers" ON events
    FOR UPDATE
    USING (organizer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Organizers can delete their own events
CREATE POLICY "Enable delete for organizers" ON events
    FOR DELETE
    USING (organizer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Anyone can add participants to events
CREATE POLICY "Enable insert for all users" ON participants
    FOR INSERT
    WITH CHECK (true);

-- Policy: Participants can view others in their event
CREATE POLICY "Enable read access for event participants" ON participants
    FOR SELECT
    USING (true);

-- Policy: Event organizers can update participant assignments
CREATE POLICY "Enable update for event organizers" ON participants
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = participants.event_id 
            AND events.organizer_email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- Policy: Event organizers can delete participants
CREATE POLICY "Enable delete for event organizers" ON participants
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = participants.event_id 
            AND events.organizer_email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- ============================================
-- HELPFUL VIEWS
-- Convenient queries for common operations
-- ============================================

-- View: Event summary with participant count
CREATE OR REPLACE VIEW event_summary AS
SELECT 
    e.id,
    e.event_name,
    e.exchange_date,
    e.budget,
    e.organizer_email,
    e.created_at,
    COUNT(p.id) as participant_count,
    COUNT(p.assigned_to_id) as assignments_made
FROM events e
LEFT JOIN participants p ON e.id = p.event_id
GROUP BY e.id, e.event_name, e.exchange_date, e.budget, e.organizer_email, e.created_at;

-- View: Participant assignments with names
CREATE OR REPLACE VIEW participant_assignments AS
SELECT 
    p.id,
    p.event_id,
    e.event_name,
    p.name as giver_name,
    p.email as giver_email,
    p.wish_list as giver_wish_list,
    assigned.name as receiver_name,
    assigned.email as receiver_email,
    assigned.wish_list as receiver_wish_list
FROM participants p
LEFT JOIN participants assigned ON p.assigned_to_id = assigned.id
LEFT JOIN events e ON p.event_id = e.id;

-- ============================================
-- FUNCTIONS
-- Helper functions for Secret Santa logic
-- ============================================

-- Function: Check if all participants in an event have assignments
CREATE OR REPLACE FUNCTION check_assignments_complete(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_participants INTEGER;
    assigned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_participants
    FROM participants
    WHERE event_id = p_event_id;
    
    SELECT COUNT(*) INTO assigned_count
    FROM participants
    WHERE event_id = p_event_id AND assigned_to_id IS NOT NULL;
    
    RETURN total_participants > 0 AND total_participants = assigned_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Clear all assignments for an event (to regenerate)
CREATE OR REPLACE FUNCTION clear_assignments(p_event_id UUID)
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE participants
    SET assigned_to_id = NULL
    WHERE event_id = p_event_id;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to insert sample data
-- ============================================

/*
-- Sample event
INSERT INTO events (event_name, exchange_date, budget, organizer_email)
VALUES ('Office Christmas 2025', '2025-12-20', 50.00, 'organizer@example.com');

-- Sample participants (replace with actual event_id)
INSERT INTO participants (event_id, name, email, wish_list)
VALUES 
    ((SELECT id FROM events WHERE event_name = 'Office Christmas 2025'), 'Alice Johnson', 'alice@example.com', 'Books, Coffee, Plants'),
    ((SELECT id FROM events WHERE event_name = 'Office Christmas 2025'), 'Bob Smith', 'bob@example.com', 'Tech gadgets, Board games'),
    ((SELECT id FROM events WHERE event_name = 'Office Christmas 2025'), 'Carol White', 'carol@example.com', 'Art supplies, Music');
*/

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify setup
-- ============================================

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('events', 'participants');

-- Check indexes exist
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('events', 'participants');

-- Check constraints
-- SELECT conname, contype FROM pg_constraint WHERE conrelid IN ('events'::regclass, 'participants'::regclass);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- You can now use your Secret Santa Generator with these tables!

