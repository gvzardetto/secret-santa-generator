// Secret Santa Generator - Supabase Integration
// Handles all database operations

// ==============================================
// SUPABASE CLIENT INITIALIZATION
// ==============================================

let supabaseClient = null;

/**
 * Initializes the Supabase client
 * Reads configuration from window.SUPABASE_CONFIG
 */
function initializeSupabase() {
    try {
        // Check if config exists
        if (!window.SUPABASE_CONFIG) {
            console.error('❌ Supabase config not found! Please create js/config.js');
            return false;
        }

        const { url, anonKey } = window.SUPABASE_CONFIG;

        // Validate config
        if (!url || !anonKey) {
            console.error('❌ Invalid Supabase config! URL and anon key are required.');
            return false;
        }

        if (url.includes('your-project-ref') || anonKey.includes('your-anon-key')) {
            console.warn('⚠️ Using example Supabase config. Please update js/config.js with your credentials.');
            return false;
        }

        // Initialize Supabase client
        supabaseClient = supabase.createClient(url, anonKey);
        
        console.log('✅ Supabase client initialized successfully');
        console.log('📍 Connected to:', url);
        
        return true;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

/**
 * Checks if Supabase client is initialized
 */
function isSupabaseReady() {
    return supabaseClient !== null;
}

// ==============================================
// EVENT OPERATIONS
// ==============================================

/**
 * Saves a new Secret Santa event to the database
 * 
 * @param {Object} eventData - Event information
 * @param {string} eventData.name - Event name
 * @param {string} eventData.exchangeDate - Exchange date (YYYY-MM-DD)
 * @param {number|null} eventData.budget - Budget amount
 * @param {string} eventData.organizerEmail - Organizer's email
 * @returns {Promise<Object>} Created event object with ID
 * @throws {Error} If save fails
 */
async function saveEvent(eventData) {
    console.log('💾 Saving event to database...', eventData);
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        // Prepare data for database
        const eventRecord = {
            event_name: eventData.name,
            exchange_date: eventData.exchangeDate,
            budget: eventData.budget,
            organizer_email: eventData.organizerEmail
        };

        // Insert into events table
        const { data, error } = await supabaseClient
            .from('events')
            .insert([eventRecord])
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving event:', error);
            throw error;
        }

        console.log('✅ Event saved successfully:', data);
        return data;

    } catch (error) {
        console.error('❌ Failed to save event:', error.message);
        throw new Error(`Failed to save event: ${error.message}`);
    }
}

// ==============================================
// PARTICIPANT OPERATIONS
// ==============================================

/**
 * Saves multiple participants to the database
 * 
 * @param {string} eventId - UUID of the event
 * @param {Array<Object>} participantsArray - Array of participant objects
 * @param {string} participantsArray[].name - Participant name
 * @param {string} participantsArray[].email - Participant email
 * @param {string|null} participantsArray[].wishList - Optional wish list
 * @returns {Promise<Array<Object>>} Array of created participant records with IDs
 * @throws {Error} If save fails
 */
async function saveParticipants(eventId, participantsArray) {
    console.log(`💾 Saving ${participantsArray.length} participants for event ${eventId}...`);
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        if (!eventId) {
            throw new Error('Event ID is required');
        }

        if (!Array.isArray(participantsArray) || participantsArray.length === 0) {
            throw new Error('Participants array is required and must not be empty');
        }

        // Prepare participant records
        const participantRecords = participantsArray.map(participant => ({
            event_id: eventId,
            name: participant.name,
            email: participant.email,
            wish_list: participant.wishList || null
        }));

        // Insert all participants
        const { data, error } = await supabaseClient
            .from('participants')
            .insert(participantRecords)
            .select();

        if (error) {
            console.error('❌ Error saving participants:', error);
            throw error;
        }

        console.log(`✅ Successfully saved ${data.length} participants:`, data);
        return data;

    } catch (error) {
        console.error('❌ Failed to save participants:', error.message);
        throw new Error(`Failed to save participants: ${error.message}`);
    }
}

// ==============================================
// ASSIGNMENT OPERATIONS
// ==============================================

/**
 * Updates Secret Santa assignments for participants
 * 
 * @param {Array<Object>} assignments - Array of assignment objects
 * @param {string} assignments[].participantId - UUID of participant giving gift
 * @param {string} assignments[].assignedToId - UUID of participant receiving gift
 * @returns {Promise<Array<Object>>} Array of updated participant records
 * @throws {Error} If update fails
 */
async function updateAssignments(assignments) {
    console.log(`🎁 Updating ${assignments.length} Secret Santa assignments...`);
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        if (!Array.isArray(assignments) || assignments.length === 0) {
            throw new Error('Assignments array is required and must not be empty');
        }

        // Update each assignment
        // Note: Supabase doesn't support batch updates directly,
        // so we'll use Promise.all for concurrent updates
        const updatePromises = assignments.map(async (assignment) => {
            const { participantId, assignedToId } = assignment;

            if (!participantId || !assignedToId) {
                throw new Error('Both participantId and assignedToId are required');
            }

            const { data, error } = await supabaseClient
                .from('participants')
                .update({ assigned_to_id: assignedToId })
                .eq('id', participantId)
                .select()
                .single();

            if (error) {
                console.error(`❌ Error updating assignment for participant ${participantId}:`, error);
                throw error;
            }

            console.log(`✅ Updated assignment: ${participantId} → ${assignedToId}`);
            return data;
        });

        // Wait for all updates to complete
        const results = await Promise.all(updatePromises);

        console.log(`✅ Successfully updated ${results.length} assignments`);
        return results;

    } catch (error) {
        console.error('❌ Failed to update assignments:', error.message);
        throw new Error(`Failed to update assignments: ${error.message}`);
    }
}

// ==============================================
// QUERY OPERATIONS (BONUS)
// ==============================================

/**
 * Retrieves an event by ID
 * 
 * @param {string} eventId - UUID of the event
 * @returns {Promise<Object>} Event object
 * @throws {Error} If query fails
 */
async function getEvent(eventId) {
    console.log(`🔍 Fetching event ${eventId}...`);
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error) {
            console.error('❌ Error fetching event:', error);
            throw error;
        }

        console.log('✅ Event retrieved:', data);
        return data;

    } catch (error) {
        console.error('❌ Failed to fetch event:', error.message);
        throw new Error(`Failed to fetch event: ${error.message}`);
    }
}

/**
 * Retrieves all participants for an event
 * 
 * @param {string} eventId - UUID of the event
 * @returns {Promise<Array<Object>>} Array of participant objects
 * @throws {Error} If query fails
 */
async function getParticipants(eventId) {
    console.log(`🔍 Fetching participants for event ${eventId}...`);
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabaseClient
            .from('participants')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Error fetching participants:', error);
            throw error;
        }

        console.log(`✅ Retrieved ${data.length} participants:`, data);
        return data;

    } catch (error) {
        console.error('❌ Failed to fetch participants:', error.message);
        throw new Error(`Failed to fetch participants: ${error.message}`);
    }
}

/**
 * Checks if assignments are complete for an event
 * 
 * @param {string} eventId - UUID of the event
 * @returns {Promise<boolean>} True if all participants have assignments
 * @throws {Error} If query fails
 */
async function checkAssignmentsComplete(eventId) {
    console.log(`🔍 Checking if assignments are complete for event ${eventId}...`);
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        // Use the database function we created
        const { data, error } = await supabaseClient
            .rpc('check_assignments_complete', { p_event_id: eventId });

        if (error) {
            console.error('❌ Error checking assignments:', error);
            throw error;
        }

        console.log(`✅ Assignments complete: ${data}`);
        return data;

    } catch (error) {
        console.error('❌ Failed to check assignments:', error.message);
        throw new Error(`Failed to check assignments: ${error.message}`);
    }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Tests the Supabase connection
 * 
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
    console.log('🔌 Testing Supabase connection...');
    
    try {
        if (!isSupabaseReady()) {
            throw new Error('Supabase client not initialized');
        }

        // Simple query to test connection
        const { error } = await supabaseClient
            .from('events')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }

        console.log('✅ Supabase connection test successful');
        return true;

    } catch (error) {
        console.error('❌ Connection test error:', error.message);
        return false;
    }
}

/**
 * Gets Supabase client instance (for advanced usage)
 * 
 * @returns {Object|null} Supabase client instance
 */
function getSupabaseClient() {
    return supabaseClient;
}

// ==============================================
// EXPORTS / GLOBAL SCOPE
// ==============================================

// Make functions available globally
window.SupabaseDB = {
    // Initialization
    initialize: initializeSupabase,
    isReady: isSupabaseReady,
    testConnection: testConnection,
    getClient: getSupabaseClient,
    
    // Event operations
    saveEvent: saveEvent,
    getEvent: getEvent,
    
    // Participant operations
    saveParticipants: saveParticipants,
    getParticipants: getParticipants,
    
    // Assignment operations
    updateAssignments: updateAssignments,
    checkAssignmentsComplete: checkAssignmentsComplete
};

// ==============================================
// AUTO-INITIALIZATION
// ==============================================

// Try to initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeSupabase();
    });
} else {
    initializeSupabase();
}

console.log('📦 Supabase module loaded');

