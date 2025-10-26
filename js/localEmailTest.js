// Local Development Email Service
// This bypasses the serverless function for local testing

/**
 * Local email testing function
 * This simulates email sending for local development
 */
async function sendEmailsLocally(emails) {
    console.log('🧪 LOCAL TEST MODE: Simulating email sending...');
    console.log(`📧 Would send ${emails.length} emails:`);
    
    const results = [];
    
    for (const email of emails) {
        console.log(`📤 Would send to: ${email.to}`);
        console.log(`📋 Subject: ${email.subject}`);
        
        // Simulate different outcomes based on email provider
        let success = true;
        let error = null;
        
        if (email.to.includes('@gmail.com')) {
            success = true;
            console.log('✅ Gmail: Would succeed');
        } else if (email.to.includes('@outlook.com') || email.to.includes('@hotmail.com')) {
            success = Math.random() > 0.3; // 70% success rate
            if (!success) {
                error = 'Outlook spam filter blocked';
                console.log('⚠️ Outlook: Would likely be blocked');
            } else {
                console.log('✅ Outlook: Would succeed');
            }
        } else if (email.to.includes('@yahoo.com')) {
            success = Math.random() > 0.4; // 60% success rate
            if (!success) {
                error = 'Yahoo spam filter blocked';
                console.log('⚠️ Yahoo: Would likely be blocked');
            } else {
                console.log('✅ Yahoo: Would succeed');
            }
        } else if (email.to.includes('@empresa.com') || email.to.includes('@company.com')) {
            success = false;
            error = 'Corporate firewall blocked';
            console.log('❌ Corporate: Would be blocked');
        } else {
            success = Math.random() > 0.2; // 80% success rate
            if (!success) {
                error = 'Unknown provider issue';
                console.log('⚠️ Other: Might be blocked');
            } else {
                console.log('✅ Other: Would succeed');
            }
        }
        
        results.push({
            to: email.to,
            success: success,
            id: success ? `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
            error: error,
            errorCategory: success ? null : 'spam_filter'
        });
        
        // Small delay to simulate real sending
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 LOCAL TEST RESULTS: ${successful}/${emails.length} would succeed`);
    
    return {
        success: true,
        total: emails.length,
        successful: successful,
        failed: failed,
        results: results
    };
}

// Override the email service for local testing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🧪 LOCAL DEVELOPMENT MODE: Using simulated email service');
    
    // Override the sendAllEmails function
    window.sendAllEmailsLocal = async function(participants, assignments, eventData, organizerEmail) {
        console.log('🧪 LOCAL MODE: Simulating email sending...');
        
        const emails = [];
        
        // Generate participant emails
        for (let i = 0; i < participants.length; i++) {
            const participant = participants[i];
            const assignment = assignments[i];
            
            const emailData = {
                to: participant.email,
                subject: `🎁 Seu Amigo Secreto - ${eventData.eventName}`,
                html: getParticipantEmailTemplate(participant, assignment, eventData)
            };
            
            emails.push(emailData);
        }
        
        // Generate organizer email
        const organizerEmailData = {
            to: organizerEmail,
            subject: `✅ Confirmação - ${eventData.eventName}`,
            html: getOrganizerEmailTemplate(eventData, participants.length)
        };
        
        emails.push(organizerEmailData);
        
        // Send emails locally
        return await sendEmailsLocally(emails);
    };
    
    console.log('✅ Local email service ready! Use sendAllEmailsLocal() instead of sendAllEmails()');
}
