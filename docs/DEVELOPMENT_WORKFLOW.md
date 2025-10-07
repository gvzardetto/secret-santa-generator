# 🛠️ Development Workflow Guide

Complete step-by-step guide for editing, committing, and deploying your Amigo Secreto Online application.

---

## 📋 **The Complete Workflow**

```
Edit in Cursor → Git Commit → Push to GitHub → Vercel Auto-Deploy
```

---

## 🔧 **Step-by-Step: Making Changes**

### **Step 1: Open Your Project in Cursor**

1. **Open Cursor** (VS Code)
2. **File** → **Open Folder**
3. Navigate to: `C:\Users\guilherz\Downloads\Zardalabs\secret-santa-generator`
4. Click **"Select Folder"**

---

### **Step 2: Make Your Changes**

#### **Example: Change the Button Color**

1. **Open** `index.html` in Cursor
2. **Find** the submit button (around line 340):
   ```html
   <button class="bg-santa hover:bg-santa-dark ...">
       🎁 Criar Amigo Secreto
   </button>
   ```

3. **Edit** the text or styling:
   ```html
   <button class="bg-purple-600 hover:bg-purple-700 ...">
       🎁 Criar Amigo Secreto Agora
   </button>
   ```

4. **Save** the file (`Ctrl + S`)

#### **Example: Change Email Text**

1. **Open** `js/emailService.js`
2. **Find** the greeting (around line 210):
   ```javascript
   <p>Oi, ${name}! 🎄</p>
   ```

3. **Change** to something more creative:
   ```javascript
   <p>Olá, ${name}! 🎅 Prepare-se para a magia! 🎄</p>
   ```

4. **Save** the file (`Ctrl + S`)

---

### **Step 3: Test Locally (Optional but Recommended)**

Before pushing, test your changes locally:

1. **Open Terminal** in Cursor:
   - View → Terminal (or press `` Ctrl + ` ``)

2. **Start local server:**
   ```bash
   python -m http.server 8000
   ```

3. **Open browser:**
   - Go to: http://localhost:8000

4. **Test your changes**

5. **Stop server when done:**
   - Press `Ctrl + C` in terminal

---

### **Step 4: Check Git Status**

In Cursor's terminal:

```bash
git status
```

**You'll see:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   index.html
  modified:   js/emailService.js
```

This shows which files you changed.

---

### **Step 5: Stage Your Changes**

**Option A: Stage specific files** (recommended)
```bash
git add index.html
git add js/emailService.js
```

**Option B: Stage all changed files**
```bash
git add .
```

**Verify what's staged:**
```bash
git status
```

You should see:
```
Changes to be committed:
  modified:   index.html
  modified:   js/emailService.js
```

---

### **Step 6: Commit Your Changes**

Write a descriptive commit message:

```bash
git commit -m "Update button color and improve email greeting"
```

**Commit Message Best Practices:**
- ✅ Be descriptive but concise
- ✅ Use present tense ("Update" not "Updated")
- ✅ Explain WHAT changed, not WHY (unless complex)

**Examples of good messages:**
```bash
git commit -m "Translate header to Portuguese"
git commit -m "Fix email template formatting issue"
git commit -m "Add new participant field for phone number"
git commit -m "Improve error messages with more details"
```

---

### **Step 7: Push to GitHub**

```bash
git push origin main
```

**You'll see:**
```
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
...
To https://github.com/gvzardetto/secret-santa-generator.git
   abc123..def456  main -> main
```

✅ **Your code is now on GitHub!**

---

### **Step 8: Vercel Auto-Deploy (Automatic!)**

**What happens automatically:**

1. **GitHub notifies Vercel** (within 10-30 seconds)
2. **Vercel starts building** your project
3. **Vercel deploys** to production (1-2 minutes)
4. **You get a notification** (if you have Vercel notifications enabled)

---

### **Step 9: Monitor Deployment**

#### **Option A: Check Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Click your project: **secret-santa-generator**
3. Click **"Deployments"** tab
4. See the latest deployment with:
   - 🟡 **Building...** (in progress)
   - 🟢 **Ready** (deployed successfully)
   - 🔴 **Error** (failed - click for logs)

#### **Option B: Check in Terminal**

You can also install Vercel CLI:
```bash
npm install -g vercel
vercel --version
```

Then monitor deployments:
```bash
vercel ls
```

---

### **Step 10: Test Your Changes on Live Site**

1. **Wait for** deployment to complete (~2 minutes)
2. **Go to your Vercel URL:**
   - https://secret-santa-generator-blue.vercel.app

3. **Hard refresh** to see changes:
   - `Ctrl + Shift + R` (clears cache)
   - Or `Ctrl + F5`

4. **Test** the changes you made

---

## 🎯 **Quick Reference Commands**

### **The Essential 4 Commands:**

```bash
# 1. Check what changed
git status

# 2. Stage changes
git add .

# 3. Commit with message
git commit -m "Your message here"

# 4. Push to GitHub (triggers Vercel deploy)
git push origin main
```

---

## 🎨 **Common Editing Scenarios**

### **Scenario 1: Change UI Text**

**File:** `index.html`

**Steps:**
1. Open `index.html` in Cursor
2. Find the text (use `Ctrl + F` to search)
3. Edit the text
4. Save (`Ctrl + S`)
5. Run git commands:
   ```bash
   git add index.html
   git commit -m "Update UI text"
   git push origin main
   ```
6. Wait 2 minutes
7. Refresh Vercel site

---

### **Scenario 2: Change Email Template**

**File:** `js/emailService.js`

**Steps:**
1. Open `js/emailService.js`
2. Find `getParticipantEmailTemplate` function (around line 76)
3. Edit the HTML template
4. Save
5. Git commands:
   ```bash
   git add js/emailService.js
   git commit -m "Improve email template"
   git push origin main
   ```
6. Deploy happens automatically!

---

### **Scenario 3: Change Business Logic**

**File:** `js/app.js`

**Steps:**
1. Open `js/app.js`
2. Find the function you want to change
3. Edit the logic
4. **Test locally first!** (important for logic changes)
5. Git commands:
   ```bash
   git add js/app.js
   git commit -m "Update validation logic"
   git push origin main
   ```

---

### **Scenario 4: Update Database Schema**

**File:** `database/schema.sql`

**Steps:**
1. Edit `database/schema.sql`
2. **Run in Supabase SQL Editor** (not auto-deployed!)
3. Then commit for documentation:
   ```bash
   git add database/schema.sql
   git commit -m "Add new column to participants table"
   git push origin main
   ```

**Note:** Database changes must be manually run in Supabase!

---

### **Scenario 5: Update Serverless Function**

**File:** `api/send-emails.js` or `api/config.js`

**Steps:**
1. Edit the file
2. Save
3. Git commands:
   ```bash
   git add api/
   git commit -m "Update serverless function"
   git push origin main
   ```
4. **Vercel rebuilds the function automatically!**

---

## ⚡ **Using Cursor AI Assistant**

You can also use Cursor's AI to make changes:

1. **Highlight** the code you want to change
2. **Press** `Ctrl + K`
3. **Type** what you want: "Change this to Portuguese"
4. **Accept** the suggestion
5. **Follow git workflow** above

---

## 🔄 **Complete Workflow Example**

Let's say you want to **add a phone number field** to participants:

### **Part 1: Edit Frontend (index.html)**

```bash
# 1. Open file
# Find participant card, add new field after email:

<div>
    <label>Telefone (Opcional)</label>
    <input 
        type="tel" 
        name="participantPhone[]"
        placeholder="(11) 99999-9999"
    >
</div>

# 2. Save file
```

### **Part 2: Update JavaScript (js/app.js)**

```bash
# Update collectFormData() function:

const phones = document.querySelectorAll('input[name="participantPhone[]"]');

data.participants.push({
    name: nameInput.value.trim(),
    email: emails[index].value.trim(),
    phone: phones[index].value.trim() || null,  // Add this
    wishList: wishLists[index].value.trim() || null
});
```

### **Part 3: Update Database**

```sql
-- In Supabase SQL Editor:
ALTER TABLE participants ADD COLUMN phone TEXT;
```

### **Part 4: Git Workflow**

```bash
# Check changes
git status

# Stage files
git add index.html js/app.js

# Commit
git commit -m "Add phone number field to participants"

# Push (triggers auto-deploy)
git push origin main
```

### **Part 5: Wait & Test**

- Wait 2 minutes for Vercel deploy
- Refresh https://secret-santa-generator-blue.vercel.app
- Test the new phone field!

---

## 🚨 **Troubleshooting**

### **Problem: Git says "nothing to commit"**

**Cause:** You didn't save the file

**Solution:**
```bash
# Save in Cursor: Ctrl + S
# Then try git add again
```

---

### **Problem: Push rejected**

**Error:**
```
! [rejected] main -> main (fetch first)
```

**Cause:** Someone else pushed changes (or you pushed from another computer)

**Solution:**
```bash
git pull origin main
git push origin main
```

---

### **Problem: Merge conflict**

**Cause:** Same file edited in two places

**Solution:**
```bash
# 1. Pull changes
git pull origin main

# 2. Cursor will show conflict markers:
<<<<<<< HEAD
Your changes
=======
Other changes
>>>>>>> main

# 3. Edit to keep what you want
# 4. Save
# 5. Commit and push
git add .
git commit -m "Resolve merge conflict"
git push origin main
```

---

### **Problem: Deploy failed on Vercel**

**Cause:** Syntax error in code

**Solution:**
1. Go to Vercel Dashboard → Deployments
2. Click the failed deployment
3. Read the error logs
4. Fix the error in your code
5. Commit and push again

---

## 📊 **Git Workflow Cheat Sheet**

### **Daily Workflow:**

```bash
# Morning: Get latest code
git pull origin main

# ... make changes in Cursor ...

# Check what changed
git status

# Stage specific files
git add file1.html file2.js

# OR stage everything
git add .

# Commit with message
git commit -m "Describe your changes"

# Push to GitHub (triggers Vercel)
git push origin main

# Evening: Done! ✅
```

---

### **Useful Git Commands:**

| Command | What It Does |
|---------|-------------|
| `git status` | Show changed files |
| `git diff` | Show exact changes |
| `git add <file>` | Stage specific file |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Save changes with message |
| `git push origin main` | Upload to GitHub |
| `git pull origin main` | Download latest from GitHub |
| `git log` | Show commit history |
| `git log --oneline` | Show short commit history |

---

## 🎯 **Best Practices**

### **1. Commit Often**
```bash
# ✅ Good: Small, focused commits
git commit -m "Add phone field to form"
git commit -m "Update email template"
git commit -m "Fix validation bug"

# ❌ Bad: Huge commits
git commit -m "Changed everything"
```

### **2. Write Clear Messages**
```bash
# ✅ Good messages
"Add participant phone number field"
"Fix email sending error for Gmail"
"Translate success messages to Portuguese"

# ❌ Bad messages
"update"
"fix"
"changes"
```

### **3. Test Before Pushing**
```bash
# Always test locally first
python -m http.server 8000
# Test at localhost:8000
# If it works, THEN push
```

### **4. Pull Before Starting**
```bash
# Start each session with:
git pull origin main
# This gets latest changes
```

---

## 🚀 **Vercel Auto-Deploy Timeline**

```
0:00  You: git push origin main
        ↓
0:10  GitHub: Receives your code
        ↓
0:30  Vercel: Detects new commit
        ↓
1:00  Vercel: Starts building
        ↓
1:30  Vercel: Compiling code
        ↓
2:00  Vercel: Deploying to edge network
        ↓
2:30  Vercel: ✅ Deployment Ready!
        ↓
      Your site is updated!
```

**Total time: ~2-3 minutes**

---

## 📁 **File Types & Impact**

| File Type | Example | Deploy Impact | Database Impact |
|-----------|---------|---------------|-----------------|
| **HTML** | `index.html` | ✅ Auto-deploys | No change |
| **CSS** | In `<style>` tags | ✅ Auto-deploys | No change |
| **JavaScript (Frontend)** | `js/app.js` | ✅ Auto-deploys | No change |
| **Serverless Function** | `api/*.js` | ✅ Auto-deploys, rebuilds function | No change |
| **Config** | `vercel.json` | ✅ Auto-deploys, may need redeploy | No change |
| **Database** | `database/schema.sql` | ❌ Manual in Supabase | ✅ Changes DB |
| **Docs** | `*.md` files | ✅ Auto-deploys (visible on GitHub) | No change |

---

## 🎨 **Cursor Tips for Efficient Editing**

### **Multi-Cursor Editing:**
1. Hold `Alt` and click multiple places
2. Type once, edits everywhere

### **Find & Replace:**
1. Press `Ctrl + H`
2. Type what to find
3. Type what to replace with
4. Click "Replace All"

### **Go to Line:**
1. Press `Ctrl + G`
2. Type line number
3. Press Enter

### **Search Across Files:**
1. Press `Ctrl + Shift + F`
2. Type search term
3. See all matches across project

---

## 📝 **Example: Complete Edit Session**

Let's say you want to **change the success banner color from green to blue**:

### **1. Find the Code:**

```bash
# In Cursor, press Ctrl + Shift + F
# Search for: "bg-gradient-to-r from-green"
# Found in: js/app.js line 819
```

### **2. Edit:**

```javascript
// Before:
banner.className = 'success-banner ... from-green-500 to-emerald-600 ...'

// After:
banner.className = 'success-banner ... from-blue-500 to-cyan-600 ...'
```

### **3. Save:**
```
Ctrl + S
```

### **4. Test Locally:**

```bash
python -m http.server 8000
# Open localhost:8000
# Submit form
# See blue banner ✅
# Ctrl + C to stop server
```

### **5. Git Workflow:**

```bash
git status
# Shows: modified: js/app.js

git add js/app.js

git commit -m "Change success banner color from green to blue"

git push origin main
```

### **6. Wait for Deploy:**

```bash
# Check Vercel dashboard or just wait 2-3 minutes
```

### **7. Verify Live:**

```bash
# Go to: https://secret-santa-generator-blue.vercel.app
# Ctrl + Shift + R (hard refresh)
# Test - blue banner should appear! ✅
```

---

## 🔄 **Rollback Changes (If Something Breaks)**

### **Option 1: Revert Last Commit**

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Edit the files
# Commit again
git add .
git commit -m "Fix previous commit"
git push origin main
```

### **Option 2: Revert to Specific Commit**

```bash
# See commit history
git log --oneline

# Output:
# abc123 (HEAD) Bad change
# def456 Good version
# ...

# Revert to good version
git revert abc123

# Push
git push origin main
```

### **Option 3: Use Vercel Rollback**

1. Vercel Dashboard → Deployments
2. Find the **good deployment**
3. Click "..." → **"Promote to Production"**
4. Instant rollback! (No git needed)

---

## 📋 **Pre-Push Checklist**

Before every `git push`, check:

- [ ] Files saved in Cursor (`Ctrl + S`)
- [ ] No syntax errors (check for red underlines)
- [ ] Tested locally (if major change)
- [ ] Commit message is descriptive
- [ ] Not committing sensitive files (`.gitignore` protects these)

---

## 🎓 **Summary**

### **The Simple 4-Step Loop:**

```
1. EDIT in Cursor
   ↓
2. GIT commands (add, commit, push)
   ↓
3. VERCEL auto-deploys (wait 2 min)
   ↓
4. TEST on live site
   ↓
   Repeat! 🔄
```

### **Minimal Commands:**

```bash
git add .
git commit -m "Your changes"
git push origin main
```

That's it! Vercel handles the rest automatically! 🚀

---

## 💡 **Pro Tips**

1. **Commit frequently** - Small commits are easier to track
2. **Pull before editing** - Avoids conflicts
3. **Test locally first** - Catch errors before deploy
4. **Use descriptive messages** - Your future self will thank you
5. **Check Vercel logs** - If deploy fails, logs tell you why

---

## 🆘 **Need Help?**

- **Git Issues:** https://git-scm.com/docs
- **Cursor Help:** https://cursor.sh/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Pronto! Você já sabe fazer o workflow completo!** 🎉

Qualquer dúvida, é só perguntar! 😊

