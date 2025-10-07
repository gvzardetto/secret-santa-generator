# 🚀 Deploying to Vercel with Email Functionality

Complete guide to deploy your Secret Santa Generator to Vercel with working email notifications.

---

## 📋 Prerequisites

1. ✅ A [Vercel](https://vercel.com) account (free)
2. ✅ Your Resend API key: `re_4VzhQghU_HkfaFsTxML51iFo8Dfrrxvi2`
3. ✅ Your code pushed to GitHub

---

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

Or use the web interface (easier for first time).

---

### Step 2: Deploy via Web Interface

#### A. Go to Vercel
1. Visit: https://vercel.com/new
2. Sign in with GitHub
3. Click **"Import Project"**

#### B. Import Your Repository
1. Find: `gvzardetto/secret-santa-generator`
2. Click **"Import"**

#### C. Configure Project
- **Framework Preset:** Other (or None)
- **Build Command:** (leave empty)
- **Output Directory:** (leave empty, we're using static files)
- **Install Command:** (leave empty)

#### D. Add Environment Variables
**IMPORTANT:** Click "Environment Variables" and add these **5 variables**:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://jkovolickaehfodthnts.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon key (from js/config.js) |
| `RESEND_API_KEY` | `re_4VzhQghU_HkfaFsTxML51iFo8Dfrrxvi2` |
| `FROM_EMAIL` | `onboarding@resend.dev` |
| `FROM_NAME` | `Secret Santa Generator` |

**Note:** For each variable, check all 3 environments: Production, Preview, Development

#### E. Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. You'll get a URL like: `https://secret-santa-generator-xxx.vercel.app`

---

### Step 3: Test Your Deployed App

1. **Visit your Vercel URL**
2. **Create a test event** with real email addresses
3. **Check your inbox** - emails should arrive! 📧

---

## 🔧 How the Serverless Function Works

### Architecture:

```
Your Browser
    ↓ (calls /api/send-emails)
Vercel Serverless Function (Node.js)
    ↓ (uses RESEND_API_KEY from environment)
Resend API
    ↓
Email Inbox ✉️
```

### The Magic:

1. **No CORS Issues**: Browser calls YOUR domain, not Resend
2. **Secure API Key**: Stored in Vercel environment, not in browser
3. **Server-to-Server**: Function calls Resend (both are servers, no CORS!)

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@vercel/node'"

**Solution:** This is normal! Vercel installs it automatically during deployment.

### Issue: "RESEND_API_KEY is not defined"

**Solution:** 
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `RESEND_API_KEY` with your key
3. Redeploy

### Issue: Emails not sending

**Solution:**
1. Check Vercel logs: Dashboard → Deployments → Latest → Functions → send-emails
2. Look for error messages
3. Verify API key is correct in environment variables

### Issue: "Failed to fetch"

**Solution:** The serverless function might be cold starting (first request is slower). Try again.

---

## 🎯 Testing Locally with Vercel Dev

Want to test locally before deploying?

```bash
# Install Vercel CLI
npm install -g vercel

# Create .env file
echo "RESEND_API_KEY=re_4VzhQghU_HkfaFsTxML51iFo8Dfrrxvi2" > .env
echo "FROM_EMAIL=onboarding@resend.dev" >> .env

# Run Vercel dev server
vercel dev
```

This runs your serverless functions locally at `http://localhost:3000`

---

## 📊 Monitoring

### View Function Logs

1. **Vercel Dashboard** → Your Project
2. Click **"Functions"** tab
3. Select **"send-emails"**
4. See all logs, execution times, errors

### Check Email Delivery

1. **Resend Dashboard**: https://resend.com/emails
2. See all sent emails, delivery status, errors

---

## 💰 Pricing

### Vercel (Hobby Plan - Free):
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (100 hours/month)
- ✅ More than enough for Secret Santa!

### Resend (Free Tier):
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ Perfect for most use cases

---

## 🔄 Updating Your App

Every time you push to GitHub, Vercel automatically redeploys!

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys!
```

---

## 🎨 Custom Domain (Optional)

Want `secretsanta.yourdomain.com` instead of `xxx.vercel.app`?

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Done!

---

## 📝 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `RESEND_API_KEY` | Authenticates with Resend API | `re_abc123...` |
| `FROM_EMAIL` | Email address to send from | `onboarding@resend.dev` |
| `FROM_NAME` | Display name in emails | `Secret Santa Generator` |

**Security Note:** These variables are ONLY accessible to your serverless function, never exposed to the browser!

---

## 🚀 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Go to vercel.com/new
- [ ] Import repository
- [ ] Add environment variables
- [ ] Click Deploy
- [ ] Test with real emails
- [ ] 🎉 Done!

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Serverless Functions**: https://vercel.com/docs/concepts/functions/serverless-functions
- **Resend Docs**: https://resend.com/docs

---

**Ready to deploy? Follow Step 2 above!** 🚀

