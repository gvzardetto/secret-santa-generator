# JavaScript Documentation - Secret Santa Generator

This document explains the JavaScript functionality in `app.js`.

## Table of Contents
1. [Features Overview](#features-overview)
2. [State Management](#state-management)
3. [Participant Management](#participant-management)
4. [Form Validation](#form-validation)
5. [Form Submission](#form-submission)
6. [Alert System](#alert-system)
7. [API Reference](#api-reference)

---

## Features Overview

### ✅ Implemented Features

1. **Dynamic Participant Management**
   - Add unlimited participants
   - Remove participants (minimum 3 required)
   - Automatic row numbering
   - Smooth animations

2. **Real-time Form Validation**
   - Required field validation
   - Email format validation
   - Duplicate email detection
   - Future date validation
   - Inline error messages

3. **Submit Button State**
   - Disabled by default
   - Enabled only when form is valid
   - Loading spinner during submission
   - Automatic reset after submission

4. **User Feedback**
   - Alert notifications (success, error, warning, info)
   - Auto-dismissing messages
   - Smooth transitions and animations

---

## State Management

### Global Variables

```javascript
let participantCount = 3;           // Current number of participants
const MIN_PARTICIPANTS = 3;         // Minimum required participants
```

### DOM Elements

All critical DOM elements are cached on page load for performance:
- Form elements
- Input fields
- Participant list container
- Buttons
- Display elements

---

## Participant Management

### Adding Participants

**Function:** `addParticipant()`

**What it does:**
1. Increments participant count
2. Creates new participant row HTML
3. Appends to participants list
4. Updates counter display
5. Enables remove buttons
6. Scrolls to new participant
7. Validates form

**Usage:**
```javascript
// Called automatically when user clicks "Add Participant" button
addParticipantBtn.addEventListener('click', addParticipant);
```

**HTML Structure Created:**
```html
<div class="participant-row">
  <h3>Participant N</h3>
  <button class="remove-participant">X</button>
  
  <input name="participantName[]" required>
  <div class="error-message"></div>
  
  <input name="participantEmail[]" type="email" required>
  <div class="error-message"></div>
  
  <textarea name="participantWishList[]"></textarea>
</div>
```

### Removing Participants

**Function:** `removeParticipant(button)`

**What it does:**
1. Checks if count is above minimum
2. Shows warning if trying to go below 3
3. Animates row removal
4. Decrements participant count
5. Renumbers all participants
6. Updates counter display
7. Updates remove button states
8. Validates form

**Usage:**
```html
<!-- Called via onclick in HTML -->
<button onclick="removeParticipant(this)">X</button>
```

**Minimum Enforcement:**
If user tries to remove when only 3 participants exist:
```javascript
showAlert('You must have at least 3 participants for Secret Santa!', 'warning');
```

### Helper Functions

#### `updateParticipantCounter()`
Updates the participant count badge display.

#### `updateParticipantNumbers()`
Renumbers all participant headings after removal.

#### `updateRemoveButtons()`
Enables/disables remove buttons based on count:
- Disabled when count ≤ 3
- Enabled when count > 3

---

## Form Validation

### Validation Strategy

**Real-time validation** triggers on:
- Input events (typing)
- Change events (date selection)
- Participant addition/removal
- Form submission attempt

### Validation Rules

#### Event Details
| Field | Rules | Error Messages |
|-------|-------|----------------|
| Event Name | Required, non-empty | "Event name is required" |
| Exchange Date | Required, future date | "Exchange date is required"<br>"Exchange date must be in the future" |
| Budget | Optional, positive number | None |
| Organizer Email | Required, valid format | "Organizer email is required"<br>"Please enter a valid email address" |

#### Participants
| Field | Rules | Error Messages |
|-------|-------|----------------|
| Name | Required, non-empty | "Name is required" |
| Email | Required, valid format, unique | "Email is required"<br>"Invalid email format"<br>"Duplicate email address" |
| Wish List | Optional | None |

### Validation Functions

#### `validateForm()`
**Purpose:** Validates entire form and updates submit button state

**Process:**
1. Clear all existing errors
2. Validate event details
3. Validate all participants
4. Check for duplicate emails
5. Update submit button state
6. Return boolean (valid/invalid)

#### `isValidEmail(email)`
**Purpose:** Validates email format using regex

**Regex Pattern:**
```javascript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Returns:** `true` if valid, `false` if invalid

#### `showError(input, message)`
**Purpose:** Displays error message for a field

**What it does:**
1. Shows error message div
2. Adds red border to input
3. Changes focus ring to red

#### `clearError(input)`
**Purpose:** Removes error message and styling

**What it does:**
1. Hides error message div
2. Removes red border
3. Restores normal styling

### Submit Button Management

**Function:** `updateSubmitButton(isValid)`

**Enabled State (Form Valid):**
```javascript
submitBtn.disabled = false;
// Full opacity, normal cursor
```

**Disabled State (Form Invalid):**
```javascript
submitBtn.disabled = true;
// 50% opacity, not-allowed cursor
```

---

## Form Submission

### Submission Flow

**Function:** `handleSubmit(event)`

**Steps:**
1. Prevent default form submission
2. Final validation check
3. Show loading state
4. Collect form data
5. Send to backend (simulated)
6. Show success/error message
7. Reset form (on success)
8. Hide loading state

### Data Collection

**Function:** `collectFormData()`

**Returns structured data:**
```javascript
{
  event: {
    name: "Office Christmas Party 2025",
    exchangeDate: "2025-12-20",
    budget: 50.00,
    organizerEmail: "organizer@example.com"
  },
  participants: [
    {
      name: "John Doe",
      email: "john@example.com",
      wishList: "Books, Coffee"
    },
    // ... more participants
  ]
}
```

### Loading States

#### `showLoadingState()`
Replaces submit button with spinner:
```html
<svg class="animate-spin">...</svg>
Creating Event...
```

#### `hideLoadingState()`
Restores original submit button text:
```html
🎁 Create Secret Santa Event
```

### API Integration Placeholder

**Function:** `simulateAPICall(data)`

Currently simulates 1.5 second API call. Replace with:

```javascript
async function sendToSupabase(data) {
  const { createClient } = supabase;
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  // Insert event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      event_name: data.event.name,
      exchange_date: data.event.exchangeDate,
      budget: data.event.budget,
      organizer_email: data.event.organizerEmail
    })
    .select()
    .single();
  
  if (eventError) throw eventError;
  
  // Insert participants
  const participantInserts = data.participants.map(p => ({
    event_id: event.id,
    name: p.name,
    email: p.email,
    wish_list: p.wishList
  }));
  
  const { error: participantsError } = await supabase
    .from('participants')
    .insert(participantInserts);
  
  if (participantsError) throw participantsError;
  
  return event;
}
```

---

## Alert System

### Alert Types

**Function:** `showAlert(message, type)`

**Available Types:**
- `success` - Green, ✅ icon
- `error` - Red, ❌ icon
- `warning` - Yellow, ⚠️ icon
- `info` - Blue, ℹ️ icon

**Features:**
- Fixed position (top-right)
- Auto-dismiss after 5 seconds
- Manual close button
- Smooth animations
- Only one alert at a time

**Example Usage:**
```javascript
showAlert('Secret Santa event created successfully! 🎉', 'success');
showAlert('Please fix all errors before submitting', 'error');
showAlert('You must have at least 3 participants!', 'warning');
```

---

## API Reference

### Public Functions

#### Participant Management
```javascript
addParticipant()                    // Adds new participant row
removeParticipant(button)           // Removes participant row
updateParticipantCounter()          // Updates count display
updateParticipantNumbers()          // Renumbers participants
updateRemoveButtons()               // Updates button states
```

#### Form Validation
```javascript
validateForm()                      // Validates entire form
isValidEmail(email)                 // Validates email format
showError(input, message)           // Shows error for field
clearError(input)                   // Clears error for field
updateSubmitButton(isValid)         // Updates submit button state
```

#### Form Submission
```javascript
handleSubmit(event)                 // Handles form submission
collectFormData()                   // Collects all form data
simulateAPICall(data)               // Simulates API call
showLoadingState()                  // Shows loading spinner
hideLoadingState()                  // Hides loading spinner
resetToDefaultState()               // Resets form to 3 participants
```

#### Alerts
```javascript
showAlert(message, type)            // Shows alert notification
```

#### Utilities
```javascript
formatDate(dateString)              // Formats date for display
```

---

## Event Listeners

### Initialization (DOMContentLoaded)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Add input listeners to existing participants
  // Run initial validation
});
```

### Button Clicks
```javascript
addParticipantBtn.addEventListener('click', addParticipant);
```

### Form Events
```javascript
form.addEventListener('submit', handleSubmit);
```

### Input Events
```javascript
eventNameInput.addEventListener('input', validateForm);
exchangeDateInput.addEventListener('change', validateForm);
organizerEmailInput.addEventListener('input', validateForm);
// Dynamically added participants also get listeners
```

---

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Required Features:**
- ES6+ JavaScript
- querySelector/querySelectorAll
- addEventListener
- Template literals
- Arrow functions
- Promises/async-await
- CSS animations

---

## Performance Considerations

1. **DOM Caching:** All frequently accessed elements are cached
2. **Event Delegation:** Remove buttons use inline handlers for simplicity
3. **Debouncing:** Real-time validation has minimal performance impact
4. **Animations:** Uses CSS transitions (hardware accelerated)
5. **Memory:** Removed rows are properly garbage collected

---

## Future Enhancements

### Planned Features
- [ ] Supabase integration
- [ ] Assignment generation algorithm
- [ ] Email sending functionality
- [ ] Edit existing events
- [ ] Exclusion rules (couples shouldn't match)
- [ ] Anonymous reveal page
- [ ] Export assignments to CSV

### Possible Improvements
- Debounce validation for better performance
- Add participant import from CSV
- Drag-and-drop reordering
- Dark mode support
- Multi-language support
- Progressive Web App (PWA)

---

## Troubleshooting

### Common Issues

**Submit button stays disabled:**
- Check browser console for errors
- Ensure all required fields are filled
- Verify email formats are correct
- Check for duplicate emails

**Participants not adding:**
- Verify JavaScript file is loaded
- Check browser console for errors
- Ensure Tailwind CSS is loaded

**Validation not working:**
- Check error-message divs exist in HTML
- Verify event listeners are attached
- Check browser console for errors

### Debug Mode

Add to console to test functions:
```javascript
// Test validation
console.log(validateForm());

// Test email validation
console.log(isValidEmail('test@example.com'));

// Test form data collection
console.log(collectFormData());
```

---

## Contributing

When modifying the JavaScript:
1. Test all validation scenarios
2. Ensure accessibility (keyboard navigation, screen readers)
3. Test on mobile devices
4. Check browser console for errors
5. Update this documentation

---

**Last Updated:** October 2025
**Version:** 1.0.0

