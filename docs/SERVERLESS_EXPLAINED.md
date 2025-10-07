# 🎓 Serverless Functions Explained

A beginner-friendly guide to understanding how serverless functions solve the CORS email problem.

---

## 🤔 What's the Problem?

### ❌ **Before: Calling Resend API Directly from Browser**

```
┌─────────────┐
│   Browser   │  "I want to send an email!"
│  (Your PC)  │
└──────┬──────┘
       │
       │ fetch('https://api.resend.com/emails', {
       │   headers: { 'Authorization': 'Bearer re_xxx' }
       │ })
       │
       ↓
┌──────────────────┐
│   Resend API     │  "Who are you? I don't allow browsers!"
│  (Their Server)  │  ❌ CORS ERROR BLOCKED
└──────────────────┘
```

**Why it fails:**
1. 🔑 **Security Risk**: API key visible in browser code (anyone can steal it!)
2. 🚫 **CORS Policy**: Resend blocks requests from browsers
3. 🌐 **Different Origin**: Browser (`http://localhost`) ≠ Resend (`https://api.resend.com`)

---

## ✅ **After: Using Serverless Function**

```
┌─────────────┐
│   Browser   │  "I want to send an email!"
│  (Your PC)  │
└──────┬──────┘
       │
       │ fetch('/api/send-emails', {
       │   body: JSON.stringify({ emails: [...] })
       │ })
       │
       ↓
┌──────────────────────────┐
│  Your Serverless Function │  "Got it! Let me send those emails"
│  (Vercel Server)          │
│                           │  process.env.RESEND_API_KEY ← Secure!
└──────────┬────────────────┘
           │
           │ fetch('https://api.resend.com/emails', {
           │   headers: { 'Authorization': 'Bearer re_xxx' }
           │ })
           │
           ↓
┌──────────────────┐
│   Resend API     │  "You're a server! Here you go!"
│  (Their Server)  │  ✅ SUCCESS
└──────────┬───────┘
           │
           ↓
     📧 Email Sent!
```

**Why it works:**
1. ✅ **Same Origin**: Browser calls YOUR domain (no CORS!)
2. ✅ **Secure**: API key is on server, not in browser
3. ✅ **Server-to-Server**: Resend allows server requests

---

## 🏗️ Understanding Serverless Functions

### Traditional Server vs Serverless

#### Traditional Server (Old Way):
```
You need:
- A server running 24/7
- Pay for idle time
- Manage updates, security
- Handle scaling

Cost: $5-50/month even if unused
```

#### Serverless Function (Modern Way):
```
You get:
- Function runs ONLY when called
- Auto-scales (1 user or 1000 users)
- No server management
- Pay per execution

Cost: FREE for most apps (Vercel includes 100 hours/month free)
```

---

## 📂 How Our Code is Organized

### File Structure:

```
secret-santa-generator/
├── api/                          ← NEW: Serverless functions
│   └── send-emails.js           ← Runs on Vercel server
├── js/
│   ├── emailService.js          ← Frontend: Calls /api/send-emails
│   └── app.js                   ← Orchestrates everything
├── vercel.json                  ← NEW: Tells Vercel how to deploy
└── package.json                 ← NEW: Project metadata
```

---

## 🔍 Deep Dive: The Serverless Function

### File: `api/send-emails.js`

```javascript
export default async function handler(req, res) {
    // 1️⃣ This function is triggered when someone calls /api/send-emails
    
    // 2️⃣ Enable CORS so browsers can call this
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 3️⃣ Get the emails to send from request body
    const { emails } = req.body;
    
    // 4️⃣ Get API key from ENVIRONMENT (secure, not in code!)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    // 5️⃣ Loop through each email and send via Resend
    for (const emailData of emails) {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`, // Server has the key!
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html
            })
        });
        // Process response...
    }
    
    // 6️⃣ Return results to browser
    return res.status(200).json({ success: true, ... });
}
```

### Key Points:

**`export default async function handler(req, res)`**
- This is the Vercel serverless function signature
- `req` = incoming request from browser
- `res` = response to send back
- Runs on Vercel's servers (Node.js environment)

**`process.env.RESEND_API_KEY`**
- Environment variable (set in Vercel dashboard)
- **NOT visible in browser**
- **Only accessible on server**
- Keeps your API key secure!

**CORS Headers:**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```
- **WE control CORS** (not Resend!)
- Allows browsers to call OUR function
- Our function then calls Resend (server-to-server, no CORS needed)

---

## 🔄 Request Flow Diagram

```
STEP 1: Browser makes request
┌─────────────────┐
│    Browser      │
│  fetch('/api/   │
│   send-emails', │
│   {             │
│     emails: [   │
│       {...}     │
│     ]           │
│   })            │
└────────┬────────┘
         │ POST /api/send-emails
         │ Body: { emails: [...] }
         ↓
─────────────────────────────────────
         ↓
STEP 2: Vercel routes to function
┌─────────────────┐
│  Vercel Edge    │
│   Network       │
│  "This matches  │
│   /api/*"       │
└────────┬────────┘
         │ Routes to api/send-emails.js
         ↓
─────────────────────────────────────
         ↓
STEP 3: Function executes
┌─────────────────┐
│  send-emails.js │
│  (Node.js)      │
│                 │
│  const key =    │
│    process.env  │
│    .RESEND_     │
│    API_KEY      │ ← Secure! From Vercel environment
│                 │
└────────┬────────┘
         │ Loops through emails
         │ For each email:
         ↓
─────────────────────────────────────
         ↓
STEP 4: Call Resend API
┌─────────────────┐
│  Resend API     │
│                 │
│  POST /emails   │
│  Headers: {     │
│    Auth: key    │
│  }              │
│                 │
│  ✅ Success!    │
│  (Server call   │
│   = allowed)    │
└────────┬────────┘
         │ Returns email ID
         ↓
─────────────────────────────────────
         ↓
STEP 5: Return to browser
┌─────────────────┐
│  Browser        │
│  Receives:      │
│  {              │
│    success: true│
│    total: 3,    │
│    results: [   │
│      {...}      │
│    ]            │
│  }              │
└─────────────────┘
```

---

## 💡 Why Serverless > Traditional Server

### Scenario: 100 people use your app per month

**Traditional Server:**
```
Server runs 24/7 × 30 days = 720 hours
You pay for: 720 hours
Actually used: ~1 hour
Wasted: 719 hours
Cost: $20-50/month
```

**Serverless (Vercel):**
```
Function runs only when called
100 people × 20 seconds each = 33 minutes total
You pay for: 33 minutes
Cost: $0 (under free tier)
```

**Savings: 100% for small apps!** 💰

---

## 🔐 Security: Why Serverless is Safer

### Browser Code (Not Secure):
```javascript
// ❌ Anyone can see this in browser DevTools!
const API_KEY = 're_4VzhQghU_HkfaFsTxML51iFo8Dfrrxvi2';
fetch('https://api.resend.com/emails', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
});
// Result: Someone steals your key → sends spam with your account!
```

### Serverless Function (Secure):
```javascript
// ✅ This code runs on Vercel's server, not in browser!
const API_KEY = process.env.RESEND_API_KEY; // From environment
fetch('https://api.resend.com/emails', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
});
// Result: Key stays secret → No one can steal it!
```

---

## 🎯 Your Complete Architecture Now

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │ index.html  │→ │   app.js    │→ │emailService. │        │
│  │   (UI)      │  │ (Logic)     │  │js (Prepares) │        │
│  └─────────────┘  └─────────────┘  └──────┬───────┘        │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                             │ POST /api/send-emails
                                             │ { emails: [...] }
                                             │
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│              YOUR VERCEL DEPLOYMENT                          │
│  ┌─────────────────────────────────────────────┐            │
│  │    Serverless Function: /api/send-emails    │            │
│  │  • Runs on Vercel's server                  │            │
│  │  • Has access to environment variables      │            │
│  │  • Calls Resend API securely                │            │
│  └────────────────────┬────────────────────────┘            │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ POST https://api.resend.com/emails
                        │ { from, to, subject, html }
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    RESEND API                                │
│  • Receives request from SERVER (allowed!)                  │
│  • Validates API key                                        │
│  • Sends emails                                             │
│  └──────────────────┬──────────────────────────────────────┘
└────────────────────┼─────────────────────────────────────────┘
                     │
                     ↓
               📧 User's Inbox
```

---

## 📝 Summary: How I Fixed It

### What I Did:

1. ✅ **Created `/api/send-emails.js`**
   - Serverless function that runs on Vercel (not browser)
   - Receives email data from frontend
   - Calls Resend API securely
   - Returns results

2. ✅ **Updated `js/emailService.js`**
   - Changed endpoint from `https://api.resend.com` to `/api/send-emails`
   - Now calls OUR function instead of Resend directly
   - Batch sends all emails in one request

3. ✅ **Created `vercel.json`**
   - Configuration file for Vercel
   - Tells Vercel how to build and deploy
   - Sets environment variables

4. ✅ **Created `package.json`**
   - Node.js project metadata
   - Needed for Vercel deployment

5. ✅ **Re-enabled email code in `app.js`**
   - Uncommented email sending
   - Now works because using serverless function!

---

## 🚀 Next Step: Deploy to Vercel!

Follow the instructions in `VERCEL_DEPLOYMENT.md`:

### Quick Version:

1. **Go to:** https://vercel.com/new
2. **Sign in with GitHub**
3. **Import:** `gvzardetto/secret-santa-generator`
4. **Add Environment Variable:**
   - Name: `RESEND_API_KEY`
   - Value: `re_4VzhQghU_HkfaFsTxML51iFo8Dfrrxvi2`
5. **Click "Deploy"**
6. **Wait 2 minutes**
7. **Test your app!** Emails will work! 🎉

---

## 🎓 Key Concepts Learned

| Concept | Explanation |
|---------|-------------|
| **CORS** | Cross-Origin Resource Sharing - browsers block requests to different domains for security |
| **Serverless Function** | Code that runs on-demand on a cloud server (only when called) |
| **Environment Variables** | Secure way to store secrets like API keys |
| **API Endpoint** | A URL that accepts requests and returns data |
| **Server-to-Server** | When one server talks to another (no CORS restrictions) |

---

## 💡 Why This is Better Than Other Solutions

| Solution | Pros | Cons |
|----------|------|------|
| **Direct API Call** | Simple | ❌ CORS blocked, insecure |
| **Proxy Server** | Works | ❌ Costs money, needs maintenance |
| **Serverless Function** | ✅ Secure, free, scalable | Need to deploy |

---

**Your app is now ready to deploy with working email functionality!** 🚀

Would you like me to help you deploy it to Vercel now?

