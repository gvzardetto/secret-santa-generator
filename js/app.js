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
                <h3 class="font-semibold text-gray-700">Participante ${index}</h3>
                <button 
                    type="button" 
                    class="remove-participant text-gray-400 hover:text-santa transition disabled:opacity-30 disabled:cursor-not-allowed"
                    onclick="removeParticipant(this)"
                    ${participantCount <= MIN_PARTICIPANTS ? 'disabled' : ''}
                    aria-label="Remover participante"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Nome <span class="text-santa">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="participantName[]"
                        required
                        placeholder="Nome Completo"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-festive focus:border-transparent text-sm"
                        oninput="validateForm()"
                    >
                    <div class="error-message text-xs text-red-600 mt-1 hidden"></div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        E-mail <span class="text-santa">*</span>
                    </label>
                    <input 
                        type="email" 
                        name="participantEmail[]"
                        required
                        placeholder="email@exemplo.com"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-festive focus:border-transparent text-sm"
                        oninput="validateForm()"
                    >
                    <div class="error-message text-xs text-red-600 mt-1 hidden"></div>
                </div>
            </div>
            <div class="mt-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">
                    Lista de Desejos (Opcional)
                </label>
                <textarea 
                    name="participantWishList[]"
                    rows="2"
                    placeholder="Ideias de presente, tamanhos, preferências..."
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
        showAlert(`Você precisa de pelo menos ${MIN_PARTICIPANTS} participantes para o Amigo Secreto!`, 'warning');
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
// SECRET SANTA ASSIGNMENT ALGORITHM
// ==============================================

/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles an array in place
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (same reference)
 */
function shuffleArray(array) {
    console.log('🎲 Shuffling array with Fisher-Yates algorithm...');
    
    for (let i = array.length - 1; i > 0; i--) {
        // Generate random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements at positions i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    
    console.log('✅ Array shuffled successfully');
    return array;
}

/**
 * Generates Secret Santa assignments using circular assignment
 * Ensures everyone gives and receives exactly one gift
 * No one is assigned to themselves
 * 
 * @param {Array<Object>} participants - Array of participant objects
 * @param {string} participants[].id - Participant UUID
 * @param {string} participants[].name - Participant name
 * @param {string} participants[].email - Participant email
 * @param {string|null} participants[].wish_list - Optional wish list
 * @returns {Array<Object>} Array of assignment objects
 * @throws {Error} If participants array is invalid or too small
 */
function generateAssignments(participants) {
    console.log('🎁 Generating Secret Santa assignments...');
    console.log(`📊 Participants to assign: ${participants.length}`);
    
    try {
        // Validation
        if (!Array.isArray(participants)) {
            throw new Error('Participants must be an array');
        }
        
        if (participants.length < 3) {
            throw new Error('Need at least 3 participants for Secret Santa');
        }
        
        // Verify all participants have required fields
        participants.forEach((p, index) => {
            if (!p.id || !p.name || !p.email) {
                throw new Error(`Participant at index ${index} is missing required fields`);
            }
        });
        
        // Create a copy to avoid mutating original array
        const shuffled = [...participants];
        
        // Shuffle the participants randomly
        shuffleArray(shuffled);
        
        console.log('📋 Shuffled order:', shuffled.map(p => p.name).join(' → '));
        
        // Create circular assignments
        // Person 0 gives to Person 1
        // Person 1 gives to Person 2
        // ...
        // Person n-1 gives to Person 0
        const assignments = [];
        
        for (let i = 0; i < shuffled.length; i++) {
            const giver = shuffled[i];
            const receiver = shuffled[(i + 1) % shuffled.length]; // Wrap around to 0 at the end
            
            const assignment = {
                participantId: giver.id,
                assignedToId: receiver.id,
                assignedToName: receiver.name,
                assignedToEmail: receiver.email,
                assignedToWishList: receiver.wish_list || null
            };
            
            assignments.push(assignment);
            
            console.log(`  🎁 ${giver.name} → ${receiver.name}`);
        }
        
        // Verify assignments are valid
        validateAssignments(assignments, participants);
        
        console.log('✅ Assignments generated successfully!');
        console.log(`📊 Total assignments: ${assignments.length}`);
        
        return assignments;
        
    } catch (error) {
        console.error('❌ Error generating assignments:', error.message);
        throw error;
    }
}

/**
 * Validates that assignments are correct
 * Checks for:
 * - Everyone gives exactly once
 * - Everyone receives exactly once
 * - No self-assignments
 * 
 * @param {Array<Object>} assignments - Array of assignment objects
 * @param {Array<Object>} participants - Original participants array
 * @throws {Error} If validation fails
 */
function validateAssignments(assignments, participants) {
    console.log('🔍 Validating assignments...');
    
    const givers = new Set();
    const receivers = new Set();
    
    assignments.forEach((assignment, index) => {
        // Check for self-assignment
        if (assignment.participantId === assignment.assignedToId) {
            throw new Error(`Assignment ${index}: Participant cannot be assigned to themselves!`);
        }
        
        // Track givers and receivers
        givers.add(assignment.participantId);
        receivers.add(assignment.assignedToId);
    });
    
    // Verify everyone gives exactly once
    if (givers.size !== participants.length) {
        throw new Error(`Not all participants are giving! Expected ${participants.length}, got ${givers.size}`);
    }
    
    // Verify everyone receives exactly once
    if (receivers.size !== participants.length) {
        throw new Error(`Not all participants are receiving! Expected ${participants.length}, got ${receivers.size}`);
    }
    
    // Verify all participant IDs are accounted for
    const allParticipantIds = new Set(participants.map(p => p.id));
    givers.forEach(id => {
        if (!allParticipantIds.has(id)) {
            throw new Error(`Unknown giver ID: ${id}`);
        }
    });
    
    console.log('✅ Assignment validation passed!');
    console.log(`  - ${givers.size} unique givers`);
    console.log(`  - ${receivers.size} unique receivers`);
    console.log('  - No self-assignments');
}

// ==============================================
// FORM SUBMISSION
// ==============================================

/**
 * Handles form submission with comprehensive error handling
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    console.log('🚀 Form submission started...');
    console.log('═'.repeat(60));
    
    // Step 0: Final validation
    console.log('Passo 0: Validando formulário...');
    if (!validateForm()) {
        showNotification('Por favor, corrija todos os erros antes de enviar', 'error');
        return;
    }
    console.log('✅ Formulário validado com sucesso');
    
    // Check if Supabase is ready
    if (!window.SupabaseDB || !window.SupabaseDB.isReady()) {
        showNotification('Conexão com banco de dados não disponível. Verifique sua configuração do Supabase.', 'error');
        console.error('❌ Supabase não inicializado. Crie js/config.js com suas credenciais.');
        return;
    }
    console.log('✅ Conexão com banco de dados verificada');
    
    // Step 1: Show loading state
    showLoadingState();
    disableForm();
    
    try {
        // Step 2: Collect form data
        console.log('\n📋 Step 2: Collecting form data...');
        const formData = collectFormData();
        console.log('✅ Form data collected:', {
            event: formData.event.name,
            participants: formData.participants.length
        });
        
        // Step 3-8: Save everything and send emails
        console.log('\n💾 Steps 3-8: Processing event creation...');
        const result = await saveToSupabase(formData);
        
        // Step 9: Show success message with confetti
        console.log('\n🎉 Passo 9: Mostrando notificação de sucesso...');
        const emailStatus = result.emailResults 
            ? `E-mails enviados: ${result.emailResults.successful}/${result.emailResults.total}` 
            : 'E-mails enviados via serverless';
        
        showSuccessNotification(
            `Amigo Secreto "${result.event.event_name}" criado com sucesso!`,
            `${result.participants.length} participantes • ${result.assignments.length} sorteios • ${emailStatus}`
        );
        
        // Step 10: Reset form or show "Create Another" option
        console.log('\n🔄 Passo 10: Resetando formulário...');
        setTimeout(() => {
            enableForm();
            form.reset();
            resetToDefaultState();
            hideLoadingState();
            console.log('✅ Formulário resetado');
            console.log('═'.repeat(60));
            console.log('Pronto para criar outro evento! 🎁');
        }, 3000);
        
    } catch (error) {
        console.error('\n❌ ERROR DURING SUBMISSION:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Show user-friendly error message based on error type
        let errorMessage = 'Falha ao criar o Amigo Secreto.';
        let errorDetails = error.message;
        
        if (error.message.includes('Supabase')) {
            errorMessage = 'Erro no Banco de Dados';
            errorDetails = 'Não foi possível salvar. Verifique sua conexão.';
        } else if (error.message.includes('email')) {
            errorMessage = 'Erro no Envio de E-mails';
            errorDetails = 'Evento criado mas e-mails não foram enviados. Notifique os participantes manualmente.';
        } else if (error.message.includes('assignment')) {
            errorMessage = 'Erro no Sorteio';
            errorDetails = 'Não foi possível gerar os sorteios. Tente novamente.';
        }
        
        showNotification(`${errorMessage}: ${errorDetails}`, 'error');
        
        // Re-enable form so user can try again
        enableForm();
        hideLoadingState();
        
        console.log('═'.repeat(60));
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
 * @returns {Promise<Object>} Object containing event, participants, and assignments
 */
async function saveToSupabase(formData) {
    console.log('💾 Starting Supabase save operation...');
    console.log('═'.repeat(60));
    
    try {
        // Step 1: Save the event
        console.log('📝 Step 1: Saving event...');
        const savedEvent = await window.SupabaseDB.saveEvent(formData.event);
        console.log('✅ Event saved with ID:', savedEvent.id);
        console.log('');
        
        // Step 2: Save participants
        console.log('👥 Step 2: Saving participants...');
        const savedParticipants = await window.SupabaseDB.saveParticipants(
            savedEvent.id,
            formData.participants
        );
        console.log('✅ Participants saved:', savedParticipants.length);
        savedParticipants.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} (${p.email})`);
        });
        console.log('');
        
        // Step 3: Generate Secret Santa assignments
        console.log('🎲 Step 3: Generating Secret Santa assignments...');
        const assignments = generateAssignments(savedParticipants);
        console.log('✅ Assignments generated successfully!');
        console.log('');
        
        // Step 4: Save assignments to database
        console.log('💾 Step 4: Saving assignments to database...');
        const savedAssignments = await window.SupabaseDB.updateAssignments(assignments);
        console.log('✅ Assignments saved:', savedAssignments.length);
        console.log('');
        
        // Step 5: Send notification emails via serverless function
        console.log('📬 Step 5: Sending notification emails via serverless function...');
        let emailResults = null;
        
        try {
            // Prepare event data for emails
            const eventDataForEmail = {
                eventName: savedEvent.event_name,
                exchangeDate: savedEvent.exchange_date,
                budget: savedEvent.budget
            };
            
            // Send emails via our serverless function (no CORS issues!)
            emailResults = await window.EmailService.sendAllEmails(
                savedParticipants,
                assignments,
                eventDataForEmail,
                formData.event.organizerEmail
            );
            
            console.log('✅ Emails sent successfully!');
            console.log(`   Delivered: ${emailResults.successful}/${emailResults.total}`);
            
        } catch (emailError) {
            console.warn('⚠️ Email sending failed, but event was created successfully');
            console.warn('   Error:', emailError.message);
            console.warn('   You can manually notify participants or check Supabase for assignments');
        }
        
        console.log('');
        
        // Final summary
        console.log('═'.repeat(60));
        console.log('🎉 SECRET SANTA EVENT CREATED SUCCESSFULLY! 🎉');
        console.log('═'.repeat(60));
        console.log(`📋 Event: ${savedEvent.event_name}`);
        console.log(`📅 Date: ${savedEvent.exchange_date}`);
        console.log(`👥 Participants: ${savedParticipants.length}`);
        console.log(`🎁 Assignments: ${savedAssignments.length}`);
        if (emailResults) {
            console.log(`📧 Emails Sent: ${emailResults.successful}/${emailResults.total}`);
        }
        console.log('═'.repeat(60));
        
        return {
            event: savedEvent,
            participants: savedParticipants,
            assignments: savedAssignments,
            emailResults: emailResults
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
        Criando Evento...
    `;
}

/**
 * Hides loading state on submit button
 */
function hideLoadingState() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🎁 Criar Amigo Secreto';
}

/**
 * Disables the entire form during submission
 */
function disableForm() {
    console.log('🔒 Disabling form...');
    
    // Disable all inputs
    const allInputs = form.querySelectorAll('input, textarea, button');
    allInputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.6';
        input.style.cursor = 'not-allowed';
    });
    
    // Add loading overlay to form
    const formSections = form.querySelectorAll('.bg-white');
    formSections.forEach(section => {
        section.style.opacity = '0.7';
        section.style.pointerEvents = 'none';
    });
}

/**
 * Re-enables the form after submission
 */
function enableForm() {
    console.log('🔓 Re-enabling form...');
    
    // Re-enable all inputs
    const allInputs = form.querySelectorAll('input, textarea');
    allInputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
        input.style.cursor = '';
    });
    
    // Re-enable buttons except remove buttons that should be disabled
    const buttons = form.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.classList.contains('remove-participant') || participantCount > MIN_PARTICIPANTS) {
            button.disabled = false;
        }
        button.style.opacity = '1';
        button.style.cursor = '';
    });
    
    // Remove loading overlay
    const formSections = form.querySelectorAll('.bg-white');
    formSections.forEach(section => {
        section.style.opacity = '1';
        section.style.pointerEvents = '';
    });
    
    // Update remove buttons state
    updateRemoveButtons();
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
// NOTIFICATION SYSTEM
// ==============================================

/**
 * Shows a standard notification message
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
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

/**
 * Shows a success notification with confetti and details
 */
function showSuccessNotification(title, details = '') {
    // Remove existing notifications
    const existingAlert = document.querySelector('.success-banner');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create success banner
    const banner = document.createElement('div');
    banner.className = 'success-banner fixed top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 shadow-2xl z-50 transition-all duration-500 transform';
    banner.style.transform = 'translateY(-100%)';
    
    banner.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="text-5xl animate-bounce">🎉</div>
                    <div>
                        <h3 class="text-2xl font-bold mb-1">${title}</h3>
                        ${details ? `<p class="text-green-100">${details}</p>` : ''}
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white hover:text-green-100 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="mt-3 flex space-x-2">
                <span class="text-4xl">🎅</span>
                <span class="text-4xl">🎁</span>
                <span class="text-4xl">🎄</span>
                <span class="text-4xl">⭐</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Animate in
    setTimeout(() => {
        banner.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => banner.remove(), 500);
    }, 8000);
}

/**
 * Legacy function for backward compatibility
 */
function showAlert(message, type = 'info') {
    showNotification(message, type);
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

console.log('🎁 Amigo Secreto Online inicializado!');
console.log(`Começando com ${participantCount} participantes`);

