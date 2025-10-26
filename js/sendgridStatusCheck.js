// SendGrid Status Check
// Test if SendGrid is properly configured

async function checkSendGridStatus() {
    console.log('🔍 Checking SendGrid configuration...');
    
    try {
        const response = await fetch('/api/send-emails-sendgrid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emails: [{
                    to: 'gvzardetto@gmail.com',
                    subject: '🧪 SendGrid Test',
                    html: '<h1>SendGrid Test</h1><p>If you receive this, SendGrid is working!</p>'
                }]
            })
        });
        
        const result = await response.json();
        
        console.log('📊 SendGrid Test Result:', result);
        
        if (result.success && result.successful > 0) {
            console.log('✅ SendGrid is working correctly!');
            console.log(`📧 Successfully sent ${result.successful}/${result.total} emails`);
        } else {
            console.log('❌ SendGrid configuration issue:');
            console.log('   - Check SENDGRID_API_KEY in Vercel environment variables');
            console.log('   - Verify API key is correct');
            console.log('   - Check SendGrid account status');
        }
        
    } catch (error) {
        console.error('❌ SendGrid test failed:', error);
    }
}

// Make function available globally
window.checkSendGridStatus = checkSendGridStatus;

console.log('🧪 SendGrid test available: checkSendGridStatus()');
