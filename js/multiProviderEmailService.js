// Multi-Provider Email Service
// Supports both Resend and SendGrid with automatic fallback

/**
 * Enhanced email service that tries multiple providers
 */
async function sendEmailsMultiProvider(participants, assignments, eventData, organizerEmail) {
    console.log('📧 Starting multi-provider email sending...');
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
    
    // Try SendGrid first (better delivery rates)
    console.log('🚀 Trying SendGrid first...');
    let sendGridResults = await trySendGrid(emails);
    
    // If SendGrid fails completely, try Resend as fallback
    if (sendGridResults.successful === 0 && sendGridResults.failed > 0) {
        console.log('⚠️ SendGrid failed completely, trying Resend as fallback...');
        let resendResults = await tryResend(emails);
        
        // Merge results (prefer SendGrid successes, use Resend for failures)
        results.push(...sendGridResults.results.filter(r => r.success));
        results.push(...resendResults.results.filter(r => !sendGridResults.results.find(sr => sr.to === r.to)));
    } else {
        results.push(...sendGridResults.results);
    }
    
    // Generate detailed report
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('═'.repeat(60));
    console.log('📊 MULTI-PROVIDER EMAIL SUMMARY');
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
    
    // Generate manual notification report if needed
    if (failed > 0) {
        generateManualNotificationReport(results, eventData);
    }
    
    return {
        success: true,
        total: emails.length,
        successful: successful,
        failed: failed,
        results: results
    };
}

/**
 * Try sending emails via SendGrid
 */
async function trySendGrid(emails) {
    try {
        console.log('📧 Attempting SendGrid...');
        
        const response = await fetch('/api/send-emails-sendgrid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emails })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ SendGrid: ${result.successful}/${result.total} emails sent`);
            return result;
        } else {
            console.log(`❌ SendGrid failed: ${result.error}`);
            return {
                success: false,
                total: emails.length,
                successful: 0,
                failed: emails.length,
                results: emails.map(email => ({
                    to: email.to,
                    success: false,
                    error: result.error || 'SendGrid service unavailable'
                }))
            };
        }
    } catch (error) {
        console.error('❌ SendGrid error:', error);
        return {
            success: false,
            total: emails.length,
            successful: 0,
            failed: emails.length,
            results: emails.map(email => ({
                to: email.to,
                success: false,
                error: 'SendGrid service unavailable'
            }))
        };
    }
}

/**
 * Try sending emails via Resend (fallback)
 */
async function tryResend(emails) {
    try {
        console.log('📧 Attempting Resend fallback...');
        
        const response = await fetch('/api/send-emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emails })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Resend: ${result.successful}/${result.total} emails sent`);
            return result;
        } else {
            console.log(`❌ Resend failed: ${result.error}`);
            return {
                success: false,
                total: emails.length,
                successful: 0,
                failed: emails.length,
                results: emails.map(email => ({
                    to: email.to,
                    success: false,
                    error: result.error || 'Resend service unavailable'
                }))
            };
        }
    } catch (error) {
        console.error('❌ Resend error:', error);
        return {
            success: false,
            total: emails.length,
            successful: 0,
            failed: emails.length,
            results: emails.map(email => ({
                to: email.to,
                success: false,
                error: 'Resend service unavailable'
            }))
        };
    }
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
window.sendEmailsMultiProvider = sendEmailsMultiProvider;
