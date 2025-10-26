// Vercel Serverless Function - SendGrid Email Sender
// Alternative to Resend with better delivery rates

/**
 * HOW THIS WORKS:
 * 
 * 1. Frontend calls: POST /api/send-emails-sendgrid
 * 2. This function runs on Vercel's server
 * 3. Function calls SendGrid API (server-to-server, no CORS!)
 * 4. Returns success/failure to frontend
 * 
 * Environment Variables Needed:
 * - SENDGRID_API_KEY (set in Vercel dashboard)
 * - FROM_EMAIL (set in Vercel dashboard)
 */

export default async function handler(req, res) {
    // Enable CORS for your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
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
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sendgrid.net';
        const FROM_NAME = process.env.FROM_NAME || 'Amigo Secreto Online';
        
        if (!SENDGRID_API_KEY) {
            console.error('SENDGRID_API_KEY not set in environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error. Please contact administrator.' 
            });
        }
        
        console.log(`📧 SendGrid: Processing ${emails.length} email(s)...`);
        
        // Send all emails with SendGrid
        const results = [];
        
        for (const emailData of emails) {
            try {
                console.log(`📤 SendGrid: Sending email to: ${emailData.to}`);
                
                // Call SendGrid API
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{
                            to: [{ email: emailData.to }],
                            subject: emailData.subject
                        }],
                        from: {
                            email: FROM_EMAIL,
                            name: FROM_NAME
                        },
                        content: [{
                            type: 'text/html',
                            value: emailData.html
                        }],
                        // Add headers to improve delivery
                        headers: {
                            'X-Priority': '3',
                            'X-Mailer': 'Amigo Secreto Online'
                        }
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ SendGrid failed to send email to ${emailData.to}:`, {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorText
                    });
                    
                    // Categorize the error
                    let errorCategory = 'unknown';
                    if (response.status === 400) {
                        errorCategory = 'invalid_request';
                    } else if (response.status === 401) {
                        errorCategory = 'unauthorized';
                    } else if (response.status === 403) {
                        errorCategory = 'forbidden';
                    } else if (response.status === 429) {
                        errorCategory = 'rate_limited';
                    } else if (response.status >= 500) {
                        errorCategory = 'server_error';
                    }
                    
                    results.push({
                        to: emailData.to,
                        success: false,
                        error: `SendGrid error: ${response.status} ${response.statusText}`,
                        errorCategory: errorCategory,
                        statusCode: response.status
                    });
                } else {
                    console.log(`✅ SendGrid: Email sent to ${emailData.to}`);
                    results.push({
                        to: emailData.to,
                        success: true,
                        id: `sendgrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        statusCode: response.status
                    });
                }
                
                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`❌ SendGrid network error sending email to ${emailData.to}:`, error);
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
        
        console.log(`📊 SendGrid Summary: ${successful}/${emails.length} successful`);
        
        // Return results
        return res.status(200).json({
            success: true,
            total: emails.length,
            successful: successful,
            failed: failed,
            results: results,
            provider: 'sendgrid'
        });
        
    } catch (error) {
        console.error('❌ SendGrid serverless function error:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
}
