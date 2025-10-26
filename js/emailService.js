// Secret Santa Generator - Email Service
// Handles sending emails via Resend API

// ==============================================
// CONFIGURATION
// ==============================================

// Use our serverless function instead of calling Resend directly
// This avoids CORS issues because we're calling our own server
const EMAIL_API_ENDPOINT = '/api/send-emails'; // Vercel serverless function
const RESEND_API_ENDPOINT = 'https://api.resend.com/emails'; // Direct (has CORS issues)

/**
 * Checks if email service is configured
 * Loads from API endpoint if not found locally (for Vercel deployment)
 */
async function loadEmailConfig() {
    // Try local config first
    if (window.EMAIL_CONFIG && window.EMAIL_CONFIG.resendApiKey && 
        !window.EMAIL_CONFIG.resendApiKey.includes('your_resend_api_key')) {
        console.log('✅ Email config loaded from local file');
        return true;
    }
    
    // Try API endpoint (for Vercel)
    try {
        console.log('📍 Loading email config from API endpoint...');
        const response = await fetch('/api/config');
        
        if (response.ok) {
            const config = await response.json();
            console.log('📦 API config response:', config);
            
            if (config.email && config.email.configured) {
                // Store in window for compatibility
                window.EMAIL_CONFIG = {
                    resendApiKey: 'configured', // Not exposed to browser
                    fromEmail: config.email.fromEmail,
                    fromName: config.email.fromName
                };
                console.log('✅ Email config loaded from API endpoint');
                console.log('📧 Email will be sent via serverless function at /api/send-emails');
                return true;
            } else {
                console.warn('⚠️ Email service not configured on server');
                console.warn('💡 Make sure RESEND_API_KEY is set in Vercel environment variables');
                console.log('   Current config.email:', config.email);
                return false;
            }
        } else {
            console.error('❌ Config endpoint returned error:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Could not load email config from API:', error.message);
    }
    
    return false;
}

/**
 * Checks if email service is configured (synchronous check)
 */
function isEmailConfigured() {
    // Email is configured if we're using serverless function
    // The actual API key is on the server, not exposed to browser
    return window.EMAIL_CONFIG && window.EMAIL_CONFIG.fromEmail;
}

// ==============================================
// EMAIL TEMPLATES
// ==============================================

/**
 * Generates HTML template for participant assignment email
 */
function getParticipantEmailTemplate(participantData, assignmentData, eventData) {
    const { name } = participantData;
    const { assignedToName, assignedToWishList } = assignmentData;
    const { eventName, exchangeDate, budget } = eventData;
    
    const formattedDate = new Date(exchangeDate).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const budgetText = budget ? `R$ ${parseFloat(budget).toFixed(2)}` : 'Sem limite definido';
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="format-detection" content="telephone=no">
    <title>🎁 Seu Amigo Secreto - ${eventName}</title>
    <style>
        /* Reset styles for better email client compatibility */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            width: 100% !important;
            min-width: 100%;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .content {
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #DC2626;
        }
        .header h1 {
            color: #DC2626;
            margin: 0;
            font-size: 28px;
        }
        .emoji {
            font-size: 48px;
            margin: 20px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .event-details {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #F59E0B;
        }
        .assignment-box {
            background: #d4edda;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
            border: 2px solid #059669;
        }
        .assignment-box .label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .assignment-box .name {
            font-size: 32px;
            font-weight: bold;
            color: #059669;
            margin: 10px 0;
        }
        .wish-list {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 3px solid #6B7280;
        }
        .wish-list h3 {
            margin-top: 0;
            color: #374151;
            font-size: 16px;
        }
        .wish-list p {
            margin: 5px 0;
            font-style: italic;
        }
        .reminder {
            background: #fef2f2;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #DC2626;
            margin: 20px 0;
        }
        .reminder strong {
            color: #DC2626;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6B7280;
        }
        .detail-row {
            margin: 10px 0;
            padding: 8px 0;
        }
        .detail-row strong {
            color: #059669;
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">
                    <tr>
                        <td class="content">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td class="header" align="center">
                                        <div style="font-size: 48px; margin: 20px 0;">🎅🎁</div>
                                        <h1 style="color: #DC2626; margin: 0; font-size: 28px;">Seu Amigo Secreto</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="greeting" style="font-size: 18px; margin-bottom: 20px;">
                                        <p>Oi, ${name}! 🎄</p>
                                        <p>Os sorteios do Amigo Secreto foram realizados e você foi combinado com alguém especial!</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="event-details" style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                                        <h2 style="margin-top: 0; color: #F59E0B;">📋 Detalhes do Evento</h2>
                                        <div class="detail-row" style="margin: 10px 0; padding: 8px 0;"><strong style="color: #059669;">Evento:</strong> ${eventName}</div>
                                        <div class="detail-row" style="margin: 10px 0; padding: 8px 0;"><strong style="color: #059669;">Data da Revelação:</strong> ${formattedDate}</div>
                                        <div class="detail-row" style="margin: 10px 0; padding: 8px 0;"><strong style="color: #059669;">Valor Sugerido:</strong> ${budgetText}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="assignment-box" style="background: #d4edda; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #059669;">
                                        <div class="label" style="font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Você vai presentear:</div>
                                        <div class="name" style="font-size: 32px; font-weight: bold; color: #059669; margin: 10px 0;">🎁 ${assignedToName} 🎁</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="wish-list" style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #6B7280;">
                                        <h3 style="margin-top: 0; color: #374151; font-size: 16px;">💝 Lista de Desejos:</h3>
                                        <p style="margin: 5px 0; font-style: italic;">${assignedToWishList || 'Nenhuma preferência específica. Use sua criatividade para surpreender!'}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="reminder" style="background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #DC2626; margin: 20px 0;">
                                        <p style="margin: 5px 0;"><strong style="color: #DC2626;">🤫 Lembre-se:</strong></p>
                                        <p style="margin: 5px 0;">Mantenha o sorteio em segredo! Não conte para ninguém quem você tirou. Essa é a graça do Amigo Secreto!</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="footer" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 14px; color: #6B7280;">
                                        <p style="margin: 5px 0;">🎄 Felizes Festas! 🎄</p>
                                        <p style="margin-top: 15px; font-size: 12px;">
                                            Este e-mail foi enviado pelo Amigo Secreto Online.<br>
                                            Por favor, não responda este e-mail.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Generates HTML template for organizer confirmation email
 */
function getOrganizerEmailTemplate(eventData, participantCount) {
    const { eventName, exchangeDate, budget } = eventData;
    
    const formattedDate = new Date(exchangeDate).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const budgetText = budget ? `R$ ${parseFloat(budget).toFixed(2)}` : 'Sem limite definido';
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="format-detection" content="telephone=no">
    <title>✅ Confirmação - ${eventName}</title>
    <style>
        /* Reset styles for better email client compatibility */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            width: 100% !important;
            min-width: 100%;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .content {
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #059669;
        }
        .header h1 {
            color: #059669;
            margin: 0;
            font-size: 28px;
        }
        .success-badge {
            background: #d4edda;
            color: #059669;
            padding: 15px 25px;
            border-radius: 50px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
            font-size: 18px;
        }
        .summary-box {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            margin: 12px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-row strong {
            color: #059669;
            display: inline-block;
            min-width: 150px;
        }
        .info-box {
            background: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #F59E0B;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6B7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Evento Criado com Sucesso!</h1>
            <div class="success-badge">🎉 Amigo Secreto Pronto! 🎉</div>
        </div>
        
        <p>Ótimas notícias! Seu evento de Amigo Secreto foi criado e todos os participantes já foram notificados por e-mail!</p>
        
        <div class="summary-box">
            <h2 style="margin-top: 0; color: #374151;">📊 Resumo do Evento</h2>
            <div class="detail-row">
                <strong>Nome do Evento:</strong> ${eventName}
            </div>
            <div class="detail-row">
                <strong>Data da Revelação:</strong> ${formattedDate}
            </div>
            <div class="detail-row">
                <strong>Valor Sugerido:</strong> ${budgetText}
            </div>
            <div class="detail-row">
                <strong>Total de Participantes:</strong> ${participantCount}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span style="color: #059669; font-weight: bold;">✓ Todos os sorteios enviados</span>
            </div>
        </div>
        
        <div class="info-box">
            <h3 style="margin-top: 0;">ℹ️ O Que Acontece Agora?</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Cada participante recebeu um e-mail com seu sorteio do Amigo Secreto</li>
                <li>Os sorteios são mantidos em segredo - apenas cada pessoa sabe quem vai presentear</li>
                <li>Os participantes foram lembrados de manter o sorteio confidencial</li>
                <li>Todos os sorteios foram salvos no banco de dados para seus registros</li>
            </ul>
        </div>
        
        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #DC2626; margin: 20px 0;">
            <p style="margin: 0;"><strong>🔒 Nota de Privacidade:</strong></p>
            <p style="margin: 5px 0 0 0;">Como organizador, você tem acesso a todos os sorteios no banco de dados Supabase. Por favor, mantenha essa informação confidencial para preservar a surpresa!</p>
        </div>
        
        <div class="footer">
            <p>🎄 Felizes Festas! 🎄</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Este e-mail foi enviado pelo Amigo Secreto Online.<br>
                Por favor, não responda este e-mail.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// ==============================================
// EMAIL SENDING FUNCTIONS
// ==============================================

/**
 * Sends assignment email to a single participant
 * 
 * @param {Object} participantData - Participant information
 * @param {string} participantData.name - Participant name
 * @param {string} participantData.email - Participant email
 * @param {Object} assignmentData - Assignment details
 * @param {string} assignmentData.assignedToName - Name of person they're buying for
 * @param {string|null} assignmentData.assignedToWishList - Wish list of assigned person
 * @param {Object} eventData - Event information
 * @param {string} eventData.eventName - Name of the event
 * @param {string} eventData.exchangeDate - Gift exchange date
 * @param {number|null} eventData.budget - Suggested budget
 * @returns {Promise<Object>} Response from Resend API
 * @throws {Error} If email fails to send
 */
async function sendParticipantEmail(participantData, assignmentData, eventData) {
    console.log(`📧 Sending assignment email to ${participantData.name} (${participantData.email})...`);
    
    try {
        if (!isEmailConfigured()) {
            throw new Error('Email service not configured');
        }
        
        const { resendApiKey, fromEmail, fromName } = window.EMAIL_CONFIG;
        
        const htmlContent = getParticipantEmailTemplate(participantData, assignmentData, eventData);
        
        const emailData = {
            from: `${fromName} <${fromEmail}>`,
            to: [participantData.email],
            subject: `🎁 Seu Amigo Secreto - ${eventData.eventName}`,
            html: htmlContent
        };
        
        const response = await fetch(RESEND_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ Email send failed:', result);
            throw new Error(result.message || 'Failed to send email');
        }
        
        console.log(`✅ Email sent successfully to ${participantData.name}`);
        console.log(`   Email ID: ${result.id}`);
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error sending email to ${participantData.email}:`, error.message);
        throw error;
    }
}

/**
 * Sends confirmation email to event organizer
 * 
 * @param {string} organizerEmail - Organizer's email address
 * @param {Object} eventData - Event information
 * @param {number} participantCount - Number of participants
 * @returns {Promise<Object>} Response from Resend API
 * @throws {Error} If email fails to send
 */
async function sendOrganizerEmail(organizerEmail, eventData, participantCount) {
    console.log(`📧 Sending confirmation email to organizer (${organizerEmail})...`);
    
    try {
        if (!isEmailConfigured()) {
            throw new Error('Email service not configured');
        }
        
        const { resendApiKey, fromEmail, fromName } = window.EMAIL_CONFIG;
        
        const htmlContent = getOrganizerEmailTemplate(eventData, participantCount);
        
        const emailData = {
            from: `${fromName} <${fromEmail}>`,
            to: [organizerEmail],
            subject: `✅ Secret Santa Event Created - ${eventData.eventName}`,
            html: htmlContent
        };
        
        const response = await fetch(RESEND_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ Organizer email send failed:', result);
            throw new Error(result.message || 'Failed to send organizer email');
        }
        
        console.log('✅ Organizer confirmation email sent successfully');
        console.log(`   Email ID: ${result.id}`);
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error sending organizer email:`, error.message);
        throw error;
    }
}

/**
 * Sends emails using serverless function (avoids CORS)
 * 
 * @param {Array<Object>} participants - Array of all participants
 * @param {Array<Object>} assignments - Array of all assignments
 * @param {Object} eventData - Event information
 * @param {string} organizerEmail - Organizer's email
 * @returns {Promise<Object>} Summary of email sending results
 */
async function sendAllEmails(participants, assignments, eventData, organizerEmail) {
    console.log('📬 Starting bulk email send via serverless function...');
    console.log('═'.repeat(60));
    console.log(`👥 Participants: ${participants.length}`);
    console.log(`📧 Emails to send: ${participants.length + 1} (participants + organizer)`);
    console.log('═'.repeat(60));
    
    try {
        // Prepare all emails
        const emails = [];
        
        // Participant emails
        for (const participant of participants) {
            const assignment = assignments.find(a => a.participantId === participant.id);
            
            if (!assignment) {
                console.error(`❌ No assignment found for ${participant.name}`);
                continue;
            }
            
            const html = getParticipantEmailTemplate(
                { name: participant.name, email: participant.email },
                { 
                    assignedToName: assignment.assignedToName,
                    assignedToWishList: assignment.assignedToWishList
                },
                eventData
            );
            
            emails.push({
                to: participant.email,
                subject: `🎁 Seu Amigo Secreto - ${eventData.eventName}`,
                html: html
            });
        }
        
        // Organizer email
        const organizerHtml = getOrganizerEmailTemplate(eventData, participants.length);
        emails.push({
            to: organizerEmail,
            subject: `✅ Amigo Secreto Criado - ${eventData.eventName}`,
            html: organizerHtml
        });
        
        console.log(`📦 Prepared ${emails.length} emails, sending to serverless function...`);
        
        // Call our serverless function
        const response = await fetch(EMAIL_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emails })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send emails');
        }
        
        const result = await response.json();
        
        // Format results
        const results = {
            total: participants.length,
            successful: result.successful - 1, // Subtract organizer email
            failed: result.failed,
            errors: result.results
                .filter(r => !r.success)
                .map(r => ({ email: r.to, error: r.error })),
            emailIds: result.results
                .filter(r => r.success)
                .map(r => ({ email: r.to, emailId: r.id }))
        };
        
        // Print summary
        console.log('\n' + '═'.repeat(60));
        console.log('📊 EMAIL SEND SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Successful: ${result.successful}/${result.total}`);
        console.log(`❌ Failed: ${result.failed}/${result.total}`);
        console.log(`📈 Success Rate: ${((result.successful/result.total)*100).toFixed(1)}%`);
        
        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(err => {
                console.log(`   - ${err.email}: ${err.error}`);
            });
        }
        
        console.log('═'.repeat(60));
        
        return results;
        
    } catch (error) {
        console.error('❌ Email send failed:', error);
        throw error;
    }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Tests the email service configuration
 * 
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<boolean>} True if test successful
 */
async function testEmailService(testEmail = 'test@example.com') {
    console.log('🧪 Testing email service...');
    
    try {
        if (!isEmailConfigured()) {
            console.error('❌ Email service not configured');
            return false;
        }
        
        const testData = {
            participantData: {
                name: 'Test User',
                email: testEmail
            },
            assignmentData: {
                assignedToName: 'Sample Person',
                assignedToWishList: 'Books, Coffee, Gadgets'
            },
            eventData: {
                eventName: 'Test Secret Santa Event',
                exchangeDate: '2025-12-25',
                budget: 50
            }
        };
        
        await sendParticipantEmail(
            testData.participantData,
            testData.assignmentData,
            testData.eventData
        );
        
        console.log('✅ Email service test successful');
        return true;
        
    } catch (error) {
        console.error('❌ Email service test failed:', error);
        return false;
    }
}

// ==============================================
// EXPORTS / GLOBAL SCOPE
// ==============================================

// Make functions available globally
window.EmailService = {
    // Configuration
    isConfigured: isEmailConfigured,
    loadConfig: loadEmailConfig,
    
    // Sending functions
    sendParticipantEmail: sendParticipantEmail,
    sendOrganizerEmail: sendOrganizerEmail,
    sendAllEmails: sendAllEmails,
    
    // Utilities
    testEmailService: testEmailService
};

// ==============================================
// AUTO-INITIALIZATION
// ==============================================

// Load email config on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadEmailConfig();
    });
} else {
    loadEmailConfig().catch(err => {
        console.error('Failed to load email config:', err);
    });
}

console.log('📧 Email service module loaded');

