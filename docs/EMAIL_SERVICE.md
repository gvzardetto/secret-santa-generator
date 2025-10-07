# 📧 Email Service Documentation

Complete guide to the email notification system using Resend API.

## Overview

The Secret Santa Generator uses [Resend](https://resend.com) to send beautiful HTML email notifications to participants and organizers.

### Features

- ✅ **Participant Notifications** - Assignment emails with wish lists
- ✅ **Organizer Confirmation** - Event creation confirmation
- ✅ **Beautiful HTML Templates** - Professional, mobile-responsive designs
- ✅ **Batch Sending** - Efficient bulk email delivery
- ✅ **Error Handling** - Graceful failures with detailed logging
- ✅ **Rate Limiting** - Built-in delays to avoid API limits

---

## Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys
3. Create a new API key
4. Copy the key (starts with `re_`)

### 2. Configure Email Service

**Option A: Using config file (Recommended)**

```bash
cp js/emailConfig.example.js js/emailConfig.js
```

Edit `js/emailConfig.js`:
```javascript
window.EMAIL_CONFIG = {
    resendApiKey: 're_your_actual_api_key_here',
    fromEmail: 'noreply@yourdomain.com', // Or use 'onboarding@resend.dev' for testing
    fromName: 'Secret Santa Generator'
};
```

**Option B: Using environment variables**

Add to your `.env` file:
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Verify Domain (Production)

For production use with custom domain:

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add DNS records (MX, TXT, DKIM)
4. Wait for verification

**For Testing:** Use `onboarding@resend.dev` (no verification needed)

---

## API Reference

### Configuration Check

```javascript
// Check if email service is configured
const isConfigured = window.EmailService.isConfigured();

if (!isConfigured) {
    console.log('Email service not configured');
}
```

### Send Participant Email

```javascript
const participantData = {
    name: 'Alice Johnson',
    email: 'alice@example.com'
};

const assignmentData = {
    assignedToName: 'Bob Smith',
    assignedToWishList: 'Books, Coffee, Tech gadgets'
};

const eventData = {
    eventName: 'Office Christmas Party',
    exchangeDate: '2025-12-20',
    budget: 50.00
};

await window.EmailService.sendParticipantEmail(
    participantData,
    assignmentData,
    eventData
);
```

### Send Organizer Email

```javascript
await window.EmailService.sendOrganizerEmail(
    'organizer@example.com',
    eventData,
    participantCount
);
```

### Send All Emails

```javascript
const results = await window.EmailService.sendAllEmails(
    participants,      // Array of participant objects
    assignments,       // Array of assignment objects
    eventData,         // Event information
    organizerEmail     // Organizer's email
);

console.log(results);
// {
//     total: 5,
//     successful: 5,
//     failed: 0,
//     errors: [],
//     emailIds: [...]
// }
```

### Test Email Service

```javascript
// Send a test email
const success = await window.EmailService.testEmailService('test@example.com');

if (success) {
    console.log('✅ Email service working!');
}
```

---

## Email Templates

### Participant Assignment Email

**Subject:** `🎁 Your Secret Santa Assignment - [Event Name]`

**Contents:**
- Festive greeting
- Event details (name, date, budget)
- Assignment (who they're buying for)
- Receiver's wish list
- Secrecy reminder

**Preview:**

```
Ho ho ho, Alice! 🎄

The Secret Santa assignments have been made!

Event: Office Christmas Party
Date: Wednesday, December 20, 2025
Budget: $50.00

You are buying a gift for:
🎁 Bob Smith 🎁

Their Wish List:
Books, Coffee, Tech gadgets

🤫 Keep it secret!
```

### Organizer Confirmation Email

**Subject:** `✅ Secret Santa Event Created - [Event Name]`

**Contents:**
- Success confirmation
- Event summary
- Participant count
- Status indicators
- Next steps information

---

## Integration

### Automatic Integration

Emails are sent automatically when creating an event through the form. The workflow:

1. Event saved to database ✅
2. Participants saved ✅
3. Assignments generated ✅
4. Assignments saved ✅
5. **Emails sent** ✅

### Manual Integration

```javascript
// In your code
async function createEventWithEmails(formData) {
    // Save event and participants
    const { event, participants, assignments } = await saveToSupabase(formData);
    
    // Send emails
    if (window.EmailService.isConfigured()) {
        const emailResults = await window.EmailService.sendAllEmails(
            participants,
            assignments,
            {
                eventName: event.event_name,
                exchangeDate: event.exchange_date,
                budget: event.budget
            },
            event.organizer_email
        );
        
        console.log(`Sent ${emailResults.successful} emails`);
    }
}
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Email service not configured" | Missing API key | Configure `js/emailConfig.js` |
| "Failed to send email" | Invalid API key | Check your Resend API key |
| "Domain not verified" | Using unverified domain | Use `onboarding@resend.dev` or verify domain |
| "Rate limit exceeded" | Too many emails | Built-in delays handle this |
| "Invalid email address" | Malformed email | Validate emails before sending |

### Graceful Failure

The system is designed to fail gracefully:

```javascript
// Event is created even if emails fail
try {
    await sendAllEmails(...);
} catch (error) {
    console.warn('⚠️ Email sending failed, but event was created');
    console.warn('You can manually notify participants');
}
```

**Important:** Event creation never fails due to email errors.

---

## Rate Limiting

### Resend Limits

| Plan | Emails/Day | Emails/Second |
|------|-----------|---------------|
| Free | 100 | ~1 |
| Pro | 50,000 | ~10 |

### Built-in Protection

The email service includes automatic rate limiting:

```javascript
// 100ms delay between emails
await new Promise(resolve => setTimeout(resolve, 100));
```

For large events (50+ participants), consider upgrading to Resend Pro.

---

## Testing

### Console Testing

```javascript
// Test configuration
window.EmailService.isConfigured();

// Send test email
window.EmailService.testEmailService('your@email.com');

// Check email was sent
// Go to Resend Dashboard → Emails to verify
```

### Browser Testing

1. Open `index.html`
2. Create a test event with 3 participants
3. Open browser console (F12)
4. Watch for email sending logs:
   ```
   📧 Sending assignment email to Alice...
   ✅ Email sent successfully to Alice
   ```
5. Check Resend dashboard for delivery status

### Test Email Template

To preview email templates:

```javascript
// In browser console
const template = window.EmailService.getParticipantEmailTemplate(
    { name: 'Alice', email: 'alice@test.com' },
    { assignedToName: 'Bob', assignedToWishList: 'Books' },
    { eventName: 'Test', exchangeDate: '2025-12-25', budget: 50 }
);

// Copy template to test in email client
console.log(template);
```

---

## Monitoring

### Resend Dashboard

Access your Resend dashboard to monitor:

- ✅ **Delivery Status** - Sent, delivered, bounced
- 📊 **Analytics** - Open rates, click rates
- 🚨 **Errors** - Failed deliveries
- 📈 **Usage** - API calls, quota

### Console Logging

The service provides detailed logging:

```
📬 Starting bulk email send operation...
════════════════════════════════════════
👥 Participants: 5
📧 Emails to send: 6 (participants + organizer)
════════════════════════════════════════
📧 Sending assignment email to Alice...
✅ Email sent successfully to Alice
   Email ID: abc123xyz
...
📊 EMAIL SEND SUMMARY
════════════════════════════════════════
✅ Successful: 5/5
❌ Failed: 0/5
📈 Success Rate: 100.0%
════════════════════════════════════════
```

---

## Security

### API Key Security

✅ **Protected:**
- `js/emailConfig.js` is in `.gitignore`
- API key never committed to Git
- Only sent to Resend API

❌ **Never:**
- Commit API keys to repository
- Share API keys in emails/chat
- Expose in client-side logs (production)

### Email Privacy

- ✅ Each participant sees only their own assignment
- ✅ Emails sent individually (not CC/BCC)
- ✅ No exposure of other participants' assignments
- ⚠️ Organizer can see all assignments in database

---

## Customization

### Custom Email Templates

Edit `js/emailService.js`:

```javascript
function getParticipantEmailTemplate(participantData, assignmentData, eventData) {
    // Customize HTML here
    return `
        <!DOCTYPE html>
        <html>
            <head>...</head>
            <body>
                <!-- Your custom design -->
            </body>
        </html>
    `;
}
```

### Custom From Address

```javascript
window.EMAIL_CONFIG = {
    resendApiKey: 're_...',
    fromEmail: 'santa@yourcompany.com',
    fromName: 'Your Company Secret Santa'
};
```

### Add Attachments

```javascript
const emailData = {
    from: '...',
    to: ['...'],
    subject: '...',
    html: '...',
    attachments: [
        {
            filename: 'rules.pdf',
            content: base64Content
        }
    ]
};
```

---

## Troubleshooting

### Emails Not Sending

**Check 1:** Is service configured?
```javascript
console.log(window.EmailService.isConfigured());
```

**Check 2:** Valid API key?
```javascript
console.log(window.EMAIL_CONFIG.resendApiKey);
// Should start with 're_'
```

**Check 3:** Network issues?
```javascript
// Check browser console for network errors
// Check Resend status page
```

### Emails in Spam

**Solutions:**
1. Verify your domain in Resend
2. Add SPF, DKIM, DMARC records
3. Use professional email copy
4. Avoid spam trigger words

### Template Not Rendering

**Common causes:**
- Missing closing tags
- Invalid HTML
- Unsupported CSS

**Test:**
- Preview in browser first
- Use email-safe CSS
- Test in multiple clients

---

## Best Practices

### Production Deployment

1. ✅ Verify custom domain
2. ✅ Set up SPF/DKIM/DMARC
3. ✅ Use professional from address
4. ✅ Monitor delivery rates
5. ✅ Handle bounces appropriately

### Email Design

1. ✅ Mobile-responsive templates
2. ✅ Plain text fallback
3. ✅ Clear call-to-action
4. ✅ Unsubscribe link (if applicable)
5. ✅ Test in multiple clients

### Performance

1. ✅ Batch send with delays
2. ✅ Handle errors gracefully
3. ✅ Log all operations
4. ✅ Monitor API usage
5. ✅ Cache templates if possible

---

## Alternative Providers

If Resend doesn't work for you:

| Provider | Pros | Cons |
|----------|------|------|
| **SendGrid** | Established, reliable | More complex setup |
| **Mailgun** | Good deliverability | Higher cost |
| **AWS SES** | Very cheap | Requires AWS account |
| **Postmark** | Great for transactional | Strict limits |

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Template Best Practices](https://resend.com/docs/best-practices)
- [Troubleshooting Guide](https://resend.com/docs/troubleshooting)

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

