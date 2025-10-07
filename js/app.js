// Secret Santa Generator - JavaScript Application
// Handles form interactions, validation, and dynamic participant management

// ==============================================
// STATE MANAGEMENT
// ==============================================

let participantCount = 3;
const MIN_PARTICIPANTS = 3;

// ==============================================
// DOM ELEMENTS
// ==============================================

const form = document.getElementById('secretSantaForm');
const participantsList = document.getElementById('participantsList');
const addParticipantBtn = document.getElementById('addParticipantBtn');
const participantCountDisplay = document.getElementById('participantCount');
const submitBtn = document.getElementById('submitBtn');

// Form inputs
const eventNameInput = document.getElementById('eventName');
const exchangeDateInput = document.getElementById('exchangeDate');
const budgetInput = document.getElementById('budget');
const organizerEmailInput = document.getElementById('organizerEmail');

// ==============================================
// PARTICIPANT MANAGEMENT
// ==============================================

/**
 * Creates HTML for a new participant row
 */
function createParticipantRow(index) {
    return `
        <div class="participant-row bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300">
            <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-gray-700">Participant ${index}</h3>
                <button 
                    type="button" 
                    class="remove-participant text-gray-400 hover:text-santa transition disabled:opacity-30 disabled:cursor-not-allowed"
                    onclick="removeParticipant(this)"
                    ${participantCount <= MIN_PARTICIPANTS ? 'disabled' : ''}
                    aria-label="Remove participant"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Name <span class="text-santa">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="participantName[]"
                        required
                        placeholder="John Doe"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-festive focus:border-transparent text-sm"
                        oninput="validateForm()"
                    >
                    <div class="error-message text-xs text-red-600 mt-1 hidden"></div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Email <span class="text-santa">*</span>
                    </label>
                    <input 
                        type="email" 
                        name="participantEmail[]"
                        required
                        placeholder="john@example.com"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-festive focus:border-transparent text-sm"
                        oninput="validateForm()"
                    >
                    <div class="error-message text-xs text-red-600 mt-1 hidden"></div>
                </div>
            </div>
            <div class="mt-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">
                    Wish List (Optional)
                </label>
                <textarea 
                    name="participantWishList[]"
                    rows="2"
                    placeholder="Gift ideas, sizes, interests..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-festive focus:border-transparent text-sm resize-none"
                ></textarea>
            </div>
        </div>
    `;
}

/**
 * Adds a new participant row to the form
 */
function addParticipant() {
    participantCount++;
    
    // Create new row
    const newRow = document.createElement('div');
    newRow.innerHTML = createParticipantRow(participantCount);
    participantsList.appendChild(newRow.firstElementChild);
    
    // Update counter
    updateParticipantCounter();
    
    // Enable all remove buttons since we're above minimum
    updateRemoveButtons();
    
    // Scroll to new participant
    newRow.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Validate form
    validateForm();
}

/**
 * Removes a participant row from the form
 */
function removeParticipant(button) {
    // Check if we can remove (must have at least MIN_PARTICIPANTS)
    if (participantCount <= MIN_PARTICIPANTS) {
        showAlert(`You must have at least ${MIN_PARTICIPANTS} participants for Secret Santa!`, 'warning');
        return;
    }
    
    // Remove the row
    const row = button.closest('.participant-row');
    row.style.opacity = '0';
    row.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        row.remove();
        participantCount--;
        
        // Update participant numbers
        updateParticipantNumbers();
        
        // Update counter
        updateParticipantCounter();
        
        // Update remove buttons state
        updateRemoveButtons();
        
        // Validate form
        validateForm();
    }, 200);
}

/**
 * Updates the participant counter display
 */
function updateParticipantCounter() {
    participantCountDisplay.textContent = participantCount;
}

/**
 * Updates all participant row numbers
 */
function updateParticipantNumbers() {
    const rows = participantsList.querySelectorAll('.participant-row');
    rows.forEach((row, index) => {
        const heading = row.querySelector('h3');
        heading.textContent = `Participant ${index + 1}`;
    });
}

/**
 * Enables/disables remove buttons based on participant count
 */
function updateRemoveButtons() {
    const removeButtons = participantsList.querySelectorAll('.remove-participant');
    const shouldDisable = participantCount <= MIN_PARTICIPANTS;
    
    removeButtons.forEach(button => {
        button.disabled = shouldDisable;
    });
}

// ==============================================
// FORM VALIDATION
// ==============================================

/**
 * Validates email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Shows error message for a field
 */
function showError(input, message) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    input.classList.add('border-red-500', 'focus:ring-red-500');
    input.classList.remove('border-gray-300');
}

/**
 * Clears error message for a field
 */
function clearError(input) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }
    input.classList.remove('border-red-500', 'focus:ring-red-500');
    input.classList.add('border-gray-300');
}

/**
 * Validates all form fields
 */
function validateForm() {
    let isValid = true;
    
    // Clear all existing errors first
    const allInputs = form.querySelectorAll('input[required], input[type="email"]');
    allInputs.forEach(input => clearError(input));
    
    // Validate event name
    if (!eventNameInput.value.trim()) {
        showError(eventNameInput, 'Event name is required');
        isValid = false;
    } else {
        clearError(eventNameInput);
    }
    
    // Validate exchange date
    if (!exchangeDateInput.value) {
        showError(exchangeDateInput, 'Exchange date is required');
        isValid = false;
    } else {
        const selectedDate = new Date(exchangeDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError(exchangeDateInput, 'Exchange date must be in the future');
            isValid = false;
        } else {
            clearError(exchangeDateInput);
        }
    }
    
    // Validate organizer email
    if (!organizerEmailInput.value.trim()) {
        showError(organizerEmailInput, 'Organizer email is required');
        isValid = false;
    } else if (!isValidEmail(organizerEmailInput.value)) {
        showError(organizerEmailInput, 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError(organizerEmailInput);
    }
    
    // Validate participants
    const participantNames = document.querySelectorAll('input[name="participantName[]"]');
    const participantEmails = document.querySelectorAll('input[name="participantEmail[]"]');
    const emailSet = new Set();
    
    participantNames.forEach((nameInput, index) => {
        // Validate name
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Name is required');
            isValid = false;
        } else {
            clearError(nameInput);
        }
        
        // Validate email
        const emailInput = participantEmails[index];
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Invalid email format');
            isValid = false;
        } else if (emailSet.has(emailInput.value.toLowerCase())) {
            showError(emailInput, 'Duplicate email address');
            isValid = false;
        } else {
            emailSet.add(emailInput.value.toLowerCase());
            clearError(emailInput);
        }
    });
    
    // Update submit button state
    updateSubmitButton(isValid);
    
    return isValid;
}

/**
 * Updates submit button state
 */
function updateSubmitButton(isValid) {
    if (isValid) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// ==============================================
// FORM SUBMISSION
// ==============================================

/**
 * Handles form submission
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    // Final validation
    if (!validateForm()) {
        showAlert('Please fix all errors before submitting', 'error');
        return;
    }
    
    // Check if Supabase is ready
    if (!window.SupabaseDB || !window.SupabaseDB.isReady()) {
        showAlert('Database connection not available. Please configure Supabase credentials.', 'warning');
        console.error('Supabase not initialized. Create js/config.js with your credentials.');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        console.log('📝 Submitting form data:', formData);
        
        // Save to Supabase
        await saveToSupabase(formData);
        
        // Show success message
        showAlert('Secret Santa event created successfully! 🎉', 'success');
        
        // Reset form after delay
        setTimeout(() => {
            form.reset();
            resetToDefaultState();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        showAlert(`Error creating event: ${error.message}`, 'error');
    } finally {
        hideLoadingState();
    }
}

/**
 * Collects all form data
 */
function collectFormData() {
    const data = {
        event: {
            name: eventNameInput.value.trim(),
            exchangeDate: exchangeDateInput.value,
            budget: budgetInput.value ? parseFloat(budgetInput.value) : null,
            organizerEmail: organizerEmailInput.value.trim()
        },
        participants: []
    };
    
    const names = document.querySelectorAll('input[name="participantName[]"]');
    const emails = document.querySelectorAll('input[name="participantEmail[]"]');
    const wishLists = document.querySelectorAll('textarea[name="participantWishList[]"]');
    
    names.forEach((nameInput, index) => {
        data.participants.push({
            name: nameInput.value.trim(),
            email: emails[index].value.trim(),
            wishList: wishLists[index].value.trim() || null
        });
    });
    
    return data;
}

/**
 * Saves event and participants to Supabase
 * @param {Object} formData - Form data collected from collectFormData()
 * @returns {Promise<Object>} Object containing event and participants data
 */
async function saveToSupabase(formData) {
    console.log('💾 Starting Supabase save operation...');
    
    try {
        // Step 1: Save the event
        console.log('Step 1: Saving event...');
        const savedEvent = await window.SupabaseDB.saveEvent(formData.event);
        console.log('✅ Event saved with ID:', savedEvent.id);
        
        // Step 2: Save participants
        console.log('Step 2: Saving participants...');
        const savedParticipants = await window.SupabaseDB.saveParticipants(
            savedEvent.id,
            formData.participants
        );
        console.log('✅ Participants saved:', savedParticipants.length);
        
        // Step 3: Generate and save assignments (future enhancement)
        // For now, assignments will be generated later
        console.log('ℹ️ Assignment generation will be implemented in next phase');
        
        return {
            event: savedEvent,
            participants: savedParticipants
        };
        
    } catch (error) {
        console.error('❌ Supabase save failed:', error);
        throw error;
    }
}

/**
 * Shows loading state on submit button
 */
function showLoadingState() {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Creating Event...
    `;
}

/**
 * Hides loading state on submit button
 */
function hideLoadingState() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🎁 Create Secret Santa Event';
}

/**
 * Resets form to default state with 3 participants
 */
function resetToDefaultState() {
    // Remove extra participants
    while (participantCount > MIN_PARTICIPANTS) {
        const rows = participantsList.querySelectorAll('.participant-row');
        rows[rows.length - 1].remove();
        participantCount--;
    }
    
    updateParticipantCounter();
    updateRemoveButtons();
    validateForm();
}

// ==============================================
// ALERT SYSTEM
// ==============================================

/**
 * Shows an alert message
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Color schemes for different alert types
    const colors = {
        success: 'bg-green-100 border-green-500 text-green-800',
        error: 'bg-red-100 border-red-500 text-red-800',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        info: 'bg-blue-100 border-blue-500 text-blue-800'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert fixed top-4 right-4 ${colors[type]} border-l-4 p-4 rounded-lg shadow-lg z-50 max-w-md transition-all duration-300 transform`;
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-20px)';
    
    alert.innerHTML = `
        <div class="flex items-center">
            <span class="text-2xl mr-3">${icons[type]}</span>
            <p class="font-medium">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-600 hover:text-gray-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // Animate in
    setTimeout(() => {
        alert.style.opacity = '1';
        alert.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// ==============================================
// EVENT LISTENERS
// ==============================================

// Add participant button
addParticipantBtn.addEventListener('click', addParticipant);

// Form submission
form.addEventListener('submit', handleSubmit);

// Real-time validation on input
eventNameInput.addEventListener('input', validateForm);
exchangeDateInput.addEventListener('change', validateForm);
organizerEmailInput.addEventListener('input', validateForm);

// Add event listeners to existing participant inputs
document.addEventListener('DOMContentLoaded', () => {
    const existingInputs = form.querySelectorAll('input[required], input[type="email"]');
    existingInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
    
    // Initial validation
    validateForm();
});

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Formats date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ==============================================
// INITIALIZATION
// ==============================================

console.log('🎅 Secret Santa Generator initialized!');
console.log(`Starting with ${participantCount} participants`);

