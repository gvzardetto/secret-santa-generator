# Supabase Integration Reference

Quick reference for developers working with the Supabase integration.

## Overview

The Secret Santa Generator uses Supabase (PostgreSQL) for data persistence. All database operations are handled through the `js/supabase.js` module.

## Architecture

```
index.html
    ↓ loads
Supabase CDN (@supabase/supabase-js@2)
    ↓ loads
config.js (contains credentials)
    ↓ loads
supabase.js (database functions)
    ↓ loads
app.js (form handling)
```

## Configuration

### Setup (One-time)

1. Copy example config:
   ```bash
   cp js/config.example.js js/config.js
   ```

2. Edit `js/config.js`:
   ```javascript
   window.SUPABASE_CONFIG = {
       url: 'https://your-project.supabase.co',
       anonKey: 'your-anon-key'
   };
   ```

3. The module auto-initializes on page load

### Checking Connection

```javascript
// In browser console:
window.SupabaseDB.isReady()      // Returns true if connected
window.SupabaseDB.testConnection() // Returns promise<boolean>
```

## API Reference

### Initialization

```javascript
window.SupabaseDB.initialize()    // Manual initialization
window.SupabaseDB.isReady()       // Check if ready
window.SupabaseDB.getClient()     // Get raw Supabase client
```

### Event Operations

#### Save Event
```javascript
const eventData = {
    name: 'Office Christmas Party',
    exchangeDate: '2025-12-20',
    budget: 50.00,
    organizerEmail: 'admin@company.com'
};

const event = await window.SupabaseDB.saveEvent(eventData);
// Returns: { id: 'uuid', event_name: '...', ... }
```

#### Get Event
```javascript
const event = await window.SupabaseDB.getEvent(eventId);
// Returns: Event object or throws error
```

### Participant Operations

#### Save Participants
```javascript
const participants = [
    { name: 'John Doe', email: 'john@example.com', wishList: 'Books' },
    { name: 'Jane Smith', email: 'jane@example.com', wishList: null }
];

const saved = await window.SupabaseDB.saveParticipants(eventId, participants);
// Returns: Array of participant objects with IDs
```

#### Get Participants
```javascript
const participants = await window.SupabaseDB.getParticipants(eventId);
// Returns: Array of all participants for event
```

### Assignment Operations

#### Update Assignments
```javascript
const assignments = [
    { participantId: 'uuid-1', assignedToId: 'uuid-2' },
    { participantId: 'uuid-2', assignedToId: 'uuid-3' },
    { participantId: 'uuid-3', assignedToId: 'uuid-1' }
];

const updated = await window.SupabaseDB.updateAssignments(assignments);
// Returns: Array of updated participant records
```

#### Check if Complete
```javascript
const isComplete = await window.SupabaseDB.checkAssignmentsComplete(eventId);
// Returns: true if all participants have assignments
```

## Usage Examples

### Complete Event Creation Flow

```javascript
async function createSecretSantaEvent() {
    try {
        // 1. Save event
        const event = await window.SupabaseDB.saveEvent({
            name: 'Office Party 2025',
            exchangeDate: '2025-12-20',
            budget: 50,
            organizerEmail: 'me@example.com'
        });
        
        console.log('Event created:', event.id);
        
        // 2. Save participants
        const participants = await window.SupabaseDB.saveParticipants(event.id, [
            { name: 'Alice', email: 'alice@example.com', wishList: 'Books' },
            { name: 'Bob', email: 'bob@example.com', wishList: 'Games' },
            { name: 'Carol', email: 'carol@example.com', wishList: null }
        ]);
        
        console.log('Participants saved:', participants.length);
        
        // 3. Generate assignments (your algorithm)
        const assignments = generateAssignments(participants);
        
        // 4. Save assignments
        await window.SupabaseDB.updateAssignments(assignments);
        
        console.log('✅ Event fully set up!');
        
        return { event, participants };
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

### Retrieve Event Data

```javascript
async function loadEvent(eventId) {
    try {
        // Get event details
        const event = await window.SupabaseDB.getEvent(eventId);
        
        // Get all participants
        const participants = await window.SupabaseDB.getParticipants(eventId);
        
        // Check if assignments are complete
        const complete = await window.SupabaseDB.checkAssignmentsComplete(eventId);
        
        return {
            event,
            participants,
            assignmentsComplete: complete
        };
        
    } catch (error) {
        console.error('Error loading event:', error);
        throw error;
    }
}
```

## Error Handling

All functions throw errors with descriptive messages:

```javascript
try {
    await window.SupabaseDB.saveEvent(eventData);
} catch (error) {
    if (error.message.includes('duplicate')) {
        // Handle duplicate entry
    } else if (error.message.includes('foreign key')) {
        // Handle missing reference
    } else {
        // Generic error handling
        console.error('Database error:', error);
    }
}
```

## Database Schema Reference

### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    exchange_date DATE NOT NULL,
    budget NUMERIC(10,2),
    organizer_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Participants Table
```sql
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    wish_list TEXT,
    assigned_to_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_email_per_event UNIQUE (event_id, email),
    CONSTRAINT chk_not_assigned_to_self CHECK (id != assigned_to_id)
);
```

## Console Logging

The module provides detailed console logging for debugging:

```
✅ = Success
❌ = Error
⚠️ = Warning
ℹ️ = Info
💾 = Database operation
🔍 = Query operation
🎁 = Assignment operation
📍 = Connection info
```

### Debug Mode

Enable verbose logging:
```javascript
// In browser console
window.SUPABASE_DEBUG = true;
```

## Performance Tips

1. **Batch Operations:** Save all participants at once, not individually
2. **Connection Reuse:** The client is initialized once and reused
3. **Error Recovery:** Failed operations can be retried safely
4. **Caching:** Consider caching event data if displaying multiple times

## Security Considerations

1. **Credentials:** Never commit `js/config.js` (it's in .gitignore)
2. **RLS Policies:** Review and customize Row Level Security in Supabase
3. **Input Validation:** Always validate data before sending to database
4. **Rate Limiting:** Be aware of Supabase free tier limits

## Common Issues

### "Supabase client not initialized"
- Ensure `js/config.js` exists with valid credentials
- Check browser console for initialization errors

### "Failed to save event"
- Verify database tables exist (run schema.sql)
- Check RLS policies aren't blocking the operation
- Validate data format matches schema

### Assignment constraint violations
- Ensure participant isn't assigned to themselves
- Verify all participant IDs exist
- Check for circular references

## Advanced Usage

### Direct Supabase Client Access

For operations not covered by the wrapper:

```javascript
const client = window.SupabaseDB.getClient();

// Custom query
const { data, error } = await client
    .from('events')
    .select('*, participants(*)')
    .eq('organizer_email', 'me@example.com');
```

### Real-time Subscriptions

```javascript
const client = window.SupabaseDB.getClient();

// Subscribe to changes
const subscription = client
    .channel('events-changes')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
            console.log('New event created:', payload.new);
        }
    )
    .subscribe();

// Unsubscribe when done
subscription.unsubscribe();
```

## Testing

### Unit Testing

```javascript
// Test connection
await window.SupabaseDB.testConnection();

// Test CRUD operations
const testEvent = await window.SupabaseDB.saveEvent({
    name: 'Test Event',
    exchangeDate: '2025-12-25',
    budget: 25,
    organizerEmail: 'test@example.com'
});

// Cleanup
await window.SupabaseDB.getClient()
    .from('events')
    .delete()
    .eq('id', testEvent.id);
```

## Migration Notes

If you need to change the schema:

1. Create migration SQL in `database/migrations/`
2. Run in Supabase SQL Editor
3. Update `js/supabase.js` if API changes needed
4. Update this documentation

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **JavaScript Client:** https://supabase.com/docs/reference/javascript
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Database Functions:** https://supabase.com/docs/guides/database/functions

---

**Last Updated:** October 2025  
**Version:** 1.0.0

