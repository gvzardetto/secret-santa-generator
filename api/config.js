// Vercel Serverless Function - Config Endpoint
// Returns Supabase configuration from environment variables

/**
 * This function provides Supabase configuration to the frontend
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
        // Get Supabase credentials from environment
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
        
        // Check if configured
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.error('❌ Supabase environment variables not set');
            return res.status(500).json({ 
                error: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables.' 
            });
        }
        
        // Return config (safe because anon key is meant to be public)
        return res.status(200).json({
            url: SUPABASE_URL,
            anonKey: SUPABASE_ANON_KEY
        });
        
    } catch (error) {
        console.error('❌ Config endpoint error:', error);
        return res.status(500).json({ 
            error: 'Failed to load configuration' 
        });
    }
}

