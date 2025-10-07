# 🚀 Secret Santa Generator - Setup Guide

Complete setup instructions for getting your Secret Santa Generator up and running.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Configuration](#local-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ A modern web browser (Chrome, Firefox, Safari, Edge)
- ✅ A [Supabase](https://supabase.com) account (free tier is fine)
- ✅ Git installed (for cloning the repository)
- ✅ A code editor (VS Code, Sublime, etc.)

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. **Sign up / Log in** to [Supabase](https://supabase.com)
2. **Click "New Project"**
3. Fill in project details:
   - **Organization:** Select or create one
   - **Name:** `secret-santa` (or your preferred name)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Select closest to your users
   - **Pricing Plan:** Free tier is sufficient
4. **Click "Create new project"**
5. Wait 2-3 minutes for project to be ready

### Step 2: Get Your API Credentials

Once your project is ready:

1. Go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Keep this tab open** - you'll need these values soon!

### Step 3: Set Up Row Level Security (Optional but Recommended)

The database schema includes RLS policies. To customize them:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Review the policies for `events` and `participants` tables
3. Adjust as needed for your security requirements

---

## Local Configuration

### Step 1: Clone the Repository

```bash
git clone https://github.com/gvzardetto/secret-santa-generator.git
cd secret-santa-generator
```

### Step 2: Create Configuration File

1. **Copy the example config:**
   ```bash
   cp js/config.example.js js/config.js
   ```

2. **Edit `js/config.js`** with your credentials:
   ```javascript
   // js/config.js
   window.SUPABASE_CONFIG = {
       url: 'https://jkovolickaehfodthnts.supabase.co',  // Your Project URL
       anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // Your anon key
   };
   ```

3. **Replace the values:**
   - `url`: Paste your Project URL from Supabase
   - `anonKey`: Paste your anon public key from Supabase

4. **Save the file**

> ⚠️ **Important:** `js/config.js` is in `.gitignore` and will NOT be committed to Git. This keeps your credentials safe!

---

## Database Setup

### Step 1: Access SQL Editor

1. In your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Schema Script

1. **Open** the file `database/schema.sql` from the repository
2. **Copy all contents** (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. **Click "Run"** (or press Ctrl+Enter)

You should see:
```
Success. No rows returned
```

### Step 3: Verify Tables

1. Go to **Table Editor** in Supabase
2. You should see two tables:
   - ✅ `events`
   - ✅ `participants`
3. Click each table to verify columns

---

## Running the Application

### Option 1: Simple (Direct File)

1. Navigate to your project folder
2. **Double-click** `index.html`
3. Opens in your default browser
4. Ready to use! 🎉

### Option 2: Local Server (Recommended)

Using a local server prevents CORS issues and mimics production:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Open browser to:
http://localhost:8000
```

**Using Node.js (npx):**
```bash
npx serve .

# Opens automatically or visit:
http://localhost:3000
```

**Using VS Code:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## Testing

### Test 1: Check Console

1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. You should see:
   ```
   📦 Supabase module loaded
   ✅ Supabase client initialized successfully
   📍 Connected to: https://xxxxx.supabase.co
   🎅 Secret Santa Generator initialized!
   ```

### Test 2: Create Test Event

1. Fill in the form:
   - **Event Name:** Test Event
   - **Exchange Date:** Pick a future date
   - **Budget:** 25
   - **Organizer Email:** your@email.com

2. Add 3 participants:
   - **Participant 1:** John, john@test.com
   - **Participant 2:** Jane, jane@test.com  
   - **Participant 3:** Bob, bob@test.com

3. **Click** "🎁 Create Secret Santa Event"

4. Should see:
   - Loading spinner
   - Success message: "Secret Santa event created successfully! 🎉"
   - Form resets

### Test 3: Verify in Database

1. Go to **Supabase → Table Editor**
2. Click **events** table
3. You should see your test event
4. Click **participants** table
5. You should see 3 participants

✅ **Success!** Your app is working!

---

## Troubleshooting

### Issue: "Database connection not available"

**Cause:** Supabase credentials not configured

**Solution:**
1. Check that `js/config.js` exists
2. Verify URL and key are correct (no extra spaces)
3. Check browser console for specific error
4. Make sure Supabase project is active

### Issue: "Failed to save event"

**Possible causes:**
1. **Database not set up:** Run `database/schema.sql`
2. **RLS blocking:** Check Row Level Security policies
3. **Network issue:** Check internet connection
4. **Invalid data:** Check browser console for details

**Debug steps:**
```javascript
// Open browser console and run:
window.SupabaseDB.testConnection()
// Should return true if connection works
```

### Issue: Scripts not loading (404 errors)

**Cause:** File paths incorrect or files missing

**Solution:**
1. Check folder structure:
   ```
   secret-santa-generator/
   ├── index.html
   ├── js/
   │   ├── config.js          ← Must exist!
   │   ├── config.example.js
   │   ├── supabase.js
   │   └── app.js
   └── database/
   ```
2. Verify `js/config.js` exists (copy from `config.example.js`)

### Issue: CORS errors

**Cause:** Opening `index.html` directly (file://) can cause issues

**Solution:** Use a local server (see "Running the Application" above)

### Issue: "Supabase is not defined"

**Cause:** Supabase CDN not loaded

**Solution:**
1. Check internet connection
2. Verify CDN URL in `index.html`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
3. Try refreshing the page

### Issue: Data not saving but no errors

**Cause:** Row Level Security policies too restrictive

**Solution:**
1. Go to Supabase → **Authentication → Policies**
2. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE events DISABLE ROW LEVEL SECURITY;
   ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
   ```
3. Test again
4. Re-enable and adjust policies as needed

---

## Advanced Configuration

### Customizing RLS Policies

Edit policies in Supabase SQL Editor:

```sql
-- Example: Only allow authenticated users to create events
DROP POLICY IF EXISTS "Enable insert for all users" ON events;

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
```

### Adding Authentication

To require users to log in:

1. Enable **Email** auth in Supabase → **Authentication → Providers**
2. Add login UI to your app
3. Update RLS policies to use `auth.uid()`

See [Supabase Auth Docs](https://supabase.com/docs/guides/auth) for details.

---

## Environment Variables (Alternative Setup)

If deploying to a platform like Vercel/Netlify, use environment variables:

**.env.local:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
```

Then read them in your config:
```javascript
window.SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};
```

---

## Next Steps

Once setup is complete:

✅ Database connected and working  
✅ Test event created successfully  
✅ Ready for production use!

**Future enhancements to implement:**
- 🎲 Secret Santa assignment algorithm
- 📧 Email notifications
- 🔒 View assignment pages
- 📊 Event management dashboard

---

## Getting Help

- **Documentation:** See `README.md` and `js/README.md`
- **Database Help:** See `database/README.md`
- **Issues:** [GitHub Issues](https://github.com/gvzardetto/secret-santa-generator/issues)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

**Happy Secret Santa organizing! 🎅🎁**

