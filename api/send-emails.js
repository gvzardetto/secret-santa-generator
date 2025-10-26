// Vercel Serverless Function - Email Sender
// This runs on Vercel's server, not in the browser!

/**
 * HOW THIS WORKS:
 * 
 * 1. Frontend calls: POST /api/send-emails
 * 2. This function runs on Vercel's server
 * 3. Function calls Resend API (server-to-server, no CORS!)
 * 4. Returns success/failure to frontend
 * 
 * Environment Variables Needed:
 * - RESEND_API_KEY (set in Vercel dashboard)
 * - FROM_EMAIL (set in Vercel dashboard)
 */

export default async function handler(req, res) {
    // Enable CORS for your frontend
    // This allows your browser to call this function
    res.setHeader('Access-Control-Allow-Origin', '*'); // In production, set this to your domain
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    try {
        // Get data from request body
        const { emails } = req.body;
        
        // Validate input
        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({ 
                error: 'Invalid request. Expected { emails: [...] }' 
            });
        }
        
        // Get API key from environment variable
        // This is secure because it's stored on the server, not in browser
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
        const FROM_NAME = process.env.FROM_NAME || 'Secret Santa Generator';
        
        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY not set in environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error. Please contact administrator.' 
            });
        }
        
        console.log(`📧 Processing ${emails.length} email(s)...`);
        
        // Send all emails with improved error handling
        const results = [];
        
        for (const emailData of emails) {
            try {
                console.log(`📤 Sending email to: ${emailData.to}`);
                
                // Call Resend API from server with improved headers
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Amigo-Secreto-Online/1.0'
                    },
                    body: JSON.stringify({
                        from: `${FROM_NAME} <${FROM_EMAIL}>`,
                        to: [emailData.to],
                        subject: emailData.subject,
                        html: emailData.html,
                        // Add headers to improve delivery
                        headers: {
                            'X-Priority': '3',
                            'X-Mailer': 'Amigo Secreto Online'
                        }
                    })
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    console.error(`❌ Failed to send email to ${emailData.to}:`, {
                        status: response.status,
                        statusText: response.statusText,
                        error: result
                    });
                    
                    // Categorize the error
                    let errorCategory = 'unknown';
                    if (response.status === 422) {
                        errorCategory = 'invalid_email';
                    } else if (response.status === 429) {
                        errorCategory = 'rate_limited';
                    } else if (response.status >= 500) {
                        errorCategory = 'server_error';
                    }
                    
                    results.push({
                        to: emailData.to,
                        success: false,
                        error: result.message || 'Failed to send',
                        errorCategory: errorCategory,
                        statusCode: response.status
                    });
                } else {
                    console.log(`✅ Email sent to ${emailData.to}, ID: ${result.id}`);
                    results.push({
                        to: emailData.to,
                        success: true,
                        id: result.id,
                        statusCode: response.status
                    });
                }
                
                // Longer delay to avoid rate limiting and improve delivery
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ Network error sending email to ${emailData.to}:`, error);
                results.push({
                    to: emailData.to,
                    success: false,
                    error: error.message,
                    errorCategory: 'network_error'
                });
            }
        }
        
        // Calculate statistics
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`📊 Email Summary: ${successful}/${emails.length} successful`);
        
        // Return results
        return res.status(200).json({
            success: true,
            total: emails.length,
            successful: successful,
            failed: failed,
            results: results
        });
        
    } catch (error) {
        console.error('❌ Serverless function error:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
}

