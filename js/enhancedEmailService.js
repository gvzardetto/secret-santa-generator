// Enhanced Email Service with Fallback
// This handles Resend limitations gracefully

/**
 * Enhanced email sending with fallback for Resend limitations
 */
async function sendEmailsWithFallback(participants, assignments, eventData, organizerEmail) {
    console.log('📧 Starting enhanced email sending...');
    console.log('═'.repeat(60));
    
    const emails = [];
    const results = [];
    
    // Generate participant emails
    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const assignment = assignments[i];
        
        const emailData = {
            to: participant.email,
            subject: `🎁 Seu Amigo Secreto - ${eventData.eventName}`,
            html: getParticipantEmailTemplate(participant, assignment, eventData),
            participantName: participant.name,
            assignedToName: assignment.assignedToName
        };
        
        emails.push(emailData);
    }
    
    // Generate organizer email
    const organizerEmailData = {
        to: organizerEmail,
        subject: `✅ Confirmação - ${eventData.eventName}`,
        html: getOrganizerEmailTemplate(eventData, participants.length),
        isOrganizer: true
    };
    
    emails.push(organizerEmailData);
    
    console.log(`📤 Preparing to send ${emails.length} emails...`);
    
    // Send emails one by one
    for (const emailData of emails) {
        try {
            console.log(`📤 Sending to: ${emailData.to}`);
            
            const response = await fetch('/api/send-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emails: [emailData]
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.results && result.results.length > 0) {
                const emailResult = result.results[0];
                
                if (emailResult.success) {
                    console.log(`✅ Sent to ${emailData.to}: ${emailResult.id}`);
                    results.push({
                        to: emailData.to,
                        success: true,
                        id: emailResult.id,
                        participantName: emailData.participantName,
                        assignedToName: emailData.assignedToName,
                        isOrganizer: emailData.isOrganizer
                    });
                } else {
                    console.log(`❌ Failed to send to ${emailData.to}: ${emailResult.error}`);
                    results.push({
                        to: emailData.to,
                        success: false,
                        error: emailResult.error,
                        participantName: emailData.participantName,
                        assignedToName: emailData.assignedToName,
                        isOrganizer: emailData.isOrganizer
                    });
                }
            } else {
                console.log(`❌ Failed to send to ${emailData.to}: Server error`);
                results.push({
                    to: emailData.to,
                    success: false,
                    error: 'Server error',
                    participantName: emailData.participantName,
                    assignedToName: emailData.assignedToName,
                    isOrganizer: emailData.isOrganizer
                });
            }
            
            // Delay between emails
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Error sending to ${emailData.to}:`, error);
            results.push({
                to: emailData.to,
                success: false,
                error: error.message,
                participantName: emailData.participantName,
                assignedToName: emailData.assignedToName,
                isOrganizer: emailData.isOrganizer
            });
        }
    }
    
    // Generate detailed report
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('═'.repeat(60));
    console.log('📊 EMAIL SEND SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Successful: ${successful}/${emails.length}`);
    console.log(`❌ Failed: ${failed}/${emails.length}`);
    console.log(`📈 Success Rate: ${((successful/emails.length)*100).toFixed(1)}%`);
    
    if (failed > 0) {
        console.log('\n❌ Errors:');
        results.filter(r => !r.success).forEach(result => {
            console.log(`   - ${result.to}: ${result.error}`);
        });
    }
    
    console.log('═'.repeat(60));
    
    // Generate manual notification report
    generateManualNotificationReport(results, eventData);
    
    return {
        success: true,
        total: emails.length,
        successful: successful,
        failed: failed,
        results: results
    };
}

/**
 * Generates a detailed report for manual notifications
 */
function generateManualNotificationReport(emailResults, eventData) {
    const failedEmails = emailResults.filter(r => !r.success && !r.isOrganizer);
    
    if (failedEmails.length === 0) {
        console.log('🎉 All participant emails sent successfully!');
        return;
    }
    
    console.log('\n📋 MANUAL NOTIFICATION REQUIRED');
    console.log('═'.repeat(60));
    console.log(`📅 Event: ${eventData.eventName}`);
    console.log(`📅 Date: ${new Date(eventData.exchangeDate).toLocaleDateString('pt-BR')}`);
    console.log(`💰 Budget: ${eventData.budget ? `R$ ${parseFloat(eventData.budget).toFixed(2)}` : 'Sem limite'}`);
    console.log('\n👥 Participants to notify manually:');
    
    failedEmails.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.participantName} (${result.to})`);
        console.log(`   🎁 Should gift to: ${result.assignedToName}`);
        console.log(`   📧 Email failed: ${result.error}`);
    });
    
    console.log('\n💡 Manual notification options:');
    console.log('   - WhatsApp/Telegram messages');
    console.log('   - Phone calls');
    console.log('   - In-person communication');
    console.log('   - Social media messages');
    
    console.log('═'.repeat(60));
    
    // Copy to clipboard if possible
    copyReportToClipboard(failedEmails, eventData);
}

/**
 * Copies the report to clipboard for easy sharing
 */
function copyReportToClipboard(failedEmails, eventData) {
    if (!navigator.clipboard) {
        console.log('📋 Clipboard not available - copy manually from console');
        return;
    }
    
    let reportText = `🎁 AMIGO SECRETO - ${eventData.eventName}\n`;
    reportText += `📅 Data: ${new Date(eventData.exchangeDate).toLocaleDateString('pt-BR')}\n`;
    reportText += `💰 Orçamento: ${eventData.budget ? `R$ ${parseFloat(eventData.budget).toFixed(2)}` : 'Sem limite'}\n\n`;
    reportText += `👥 SORTEIOS (notificar manualmente):\n\n`;
    
    failedEmails.forEach((result, index) => {
        reportText += `${index + 1}. ${result.participantName}\n`;
        reportText += `   🎁 Presenteia: ${result.assignedToName}\n`;
        reportText += `   📧 E-mail: ${result.to}\n\n`;
    });
    
    navigator.clipboard.writeText(reportText).then(() => {
        console.log('📋 Report copied to clipboard! You can paste it in WhatsApp/Telegram');
    }).catch(() => {
        console.log('📋 Could not copy to clipboard - copy manually from console');
    });
}

// Export for use in app.js
window.sendEmailsWithFallback = sendEmailsWithFallback;
