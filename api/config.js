// Vercel Serverless Function - Config Endpoint
// Returns Supabase AND Email configuration from environment variables

/**
 * This function provides configuration to the frontend
 * Environment variables are stored securely on Vercel
 * This avoids committing credentials to Git
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }
    
    try {
        // Get all configuration from environment
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
        const FROM_NAME = process.env.FROM_NAME || 'Secret Santa Generator';
        
        // Build response
        const config = {};
        
        // Supabase config
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            config.supabase = {
                url: SUPABASE_URL,
                anonKey: SUPABASE_ANON_KEY
            };
        } else {
            console.warn('⚠️ Supabase environment variables not set');
        }
        
        // Email config (we don't expose the actual API key to browser)
        // The browser will call /api/send-emails instead
        if (RESEND_API_KEY) {
            config.email = {
                configured: true,
                fromEmail: FROM_EMAIL,
                fromName: FROM_NAME
            };
        } else {
            console.warn('⚠️ Email (RESEND_API_KEY) environment variable not set');
            config.email = {
                configured: false
            };
        }
        
        // Return config
        return res.status(200).json(config);
        
    } catch (error) {
        console.error('❌ Config endpoint error:', error);
        return res.status(500).json({ 
            error: 'Failed to load configuration' 
        });
    }
}

