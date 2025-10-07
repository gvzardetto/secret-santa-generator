# Database Setup for Secret Santa Generator

This directory contains the database schema and setup instructions for the Supabase backend.

## Supabase Project Details
- **Project Name**: zardalabs
- **Project Reference**: jkovolickaehfodthnts
- **Project URL**: https://jkovolickaehfodthnts.supabase.co

## Quick Setup

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/jkovolickaehfodthnts
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref jkovolickaehfodthnts

# Run the migration
supabase db push

# Or execute the SQL file directly
psql postgres://postgres:[YOUR-PASSWORD]@db.jkovolickaehfodthnts.supabase.co:5432/postgres -f schema.sql
```

## Database Schema

### Tables

#### `events`
Stores Secret Santa event information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| event_name | TEXT | Name of the event |
| exchange_date | DATE | When gifts will be exchanged |
| budget | NUMERIC(10,2) | Suggested gift budget |
| organizer_email | TEXT | Event organizer's email |
| created_at | TIMESTAMP | When the event was created |

#### `participants`
Stores participant information and Secret Santa assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| event_id | UUID | Foreign key to events table |
| name | TEXT | Participant's name |
| email | TEXT | Participant's email |
| wish_list | TEXT | Optional gift preferences |
| assigned_to_id | UUID | Who they're giving a gift to |
| created_at | TIMESTAMP | When participant was added |

### Indexes

- `idx_participants_event_id` - Fast lookup of participants by event
- `idx_participants_email` - Fast email searches
- `idx_participants_assigned_to_id` - Fast assignment lookups
- `idx_events_organizer_email` - Fast organizer lookups
- `idx_events_exchange_date` - Fast date-based queries

### Constraints

- **Foreign Keys**: Participants are linked to events with cascade delete
- **Self-Reference Prevention**: Participants cannot be assigned to themselves
- **Unique Email per Event**: Each email can only appear once per event

### Views

#### `event_summary`
Quick overview of events with participant counts.

```sql
SELECT * FROM event_summary;
```

#### `participant_assignments`
Shows who is giving to whom with full details.

```sql
SELECT * FROM participant_assignments WHERE event_id = 'your-event-id';
```

### Helper Functions

#### `check_assignments_complete(event_id UUID)`
Returns true if all participants have assignments.

```sql
SELECT check_assignments_complete('your-event-id');
```

#### `clear_assignments(event_id UUID)`
Removes all assignments for an event (useful for regenerating).

```sql
SELECT clear_assignments('your-event-id');
```

## Row Level Security (RLS)

The schema includes basic RLS policies:

- **Events**: Anyone can create/read, organizers can update/delete their own
- **Participants**: Anyone can add, organizers can manage participants in their events

**Note**: The current policies allow open access for development. Adjust these for production based on your authentication setup.

## Testing the Setup

After running the schema, verify with these queries:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'participants');

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'participants');

-- View RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('events', 'participants');
```

## Sample Data

To test with sample data, uncomment the sample data section at the bottom of `schema.sql`.

## Next Steps

1. ✅ Run the schema SQL
2. Update your `.env` file with Supabase credentials
3. Install Supabase JavaScript client:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Initialize Supabase in your app:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_ANON_KEY
   )
   ```

## Troubleshooting

### Issue: Permission denied
**Solution**: Make sure you're logged into Supabase and have the correct project selected.

### Issue: Policies blocking access
**Solution**: Check your RLS policies match your authentication setup. You may need to adjust them.

### Issue: Foreign key constraint errors
**Solution**: Ensure you're inserting events before participants, and that assigned_to_id references valid participant IDs.

## Maintenance

### Backup
```bash
# Backup your database
supabase db dump -f backup.sql
```

### Reset (Development Only)
```bash
# Drop all tables (DANGER!)
DROP TABLE participants CASCADE;
DROP TABLE events CASCADE;

# Then re-run schema.sql
```

## Support

For Supabase-specific issues, see: https://supabase.com/docs

