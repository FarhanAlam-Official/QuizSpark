# ✅ QuizSpark Setup Checklist

> **After deleting your Supabase project, follow this checklist to get back up and running!**

---

## 🎯 Setup Progress

### Phase 1: Supabase Project Setup

- [ ] **1.1** Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] **1.2** Click "New Project"
- [ ] **1.3** Enter project name: `QuizSpark`
- [ ] **1.4** Create a strong database password (SAVE IT!)
- [ ] **1.5** Select region closest to you
- [ ] **1.6** Click "Create new project"
- [ ] **1.7** Wait 2-3 minutes for provisioning ⏳

---

### Phase 2: Get API Credentials

- [ ] **2.1** In Supabase Dashboard, go to: **Settings** → **API**
- [ ] **2.2** Copy **Project URL**

  ```
  Example: https://abcdefgh123456.supabase.co
  ```

- [ ] **2.3** Copy **anon public** key

  ```
  Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- [ ] **2.4** Reveal and copy **service_role** key

  ```
  ⚠️ Keep this secret! Never expose in frontend code
  ```

---

### Phase 3: Local Project Setup

- [ ] **3.1** Open terminal in your QuizSpark project folder
- [ ] **3.2** Copy environment file:

  ```bash
  cp .env.example .env.local
  ```

- [ ] **3.3** Open `.env.local` in your code editor
- [ ] **3.4** Paste your Supabase credentials:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=paste-project-url-here
  NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key-here
  SUPABASE_SERVICE_ROLE_KEY=paste-service-role-key-here
  ```

- [ ] **3.5** Save the file (Ctrl+S / Cmd+S)

---

### Phase 4: Install Dependencies

- [ ] **4.1** Install Node.js packages:

  ```bash
  npm install
  ```

- [ ] **4.2** Wait for installation to complete
- [ ] **4.3** Verify installation (no errors)

---

### Phase 5: Database Schema Setup

**Option A: Single SQL File (Easiest)** ⭐

- [ ] **5.1** In Supabase Dashboard, go to: **SQL Editor**
- [ ] **5.2** Click: **"New Query"**
- [ ] **5.3** Open `scripts/complete-setup.sql` from your project
- [ ] **5.4** Select ALL content (Ctrl+A / Cmd+A)
- [ ] **5.5** Copy (Ctrl+C / Cmd+C)
- [ ] **5.6** Paste into Supabase SQL Editor
- [ ] **5.7** Click: **"Run"** (or press Ctrl+Enter)
- [ ] **5.8** Wait for success ✅
- [ ] **5.9** Check for completion message at bottom

**Option B: Separate Files (Alternative)**

- [ ] **5.1** In Supabase Dashboard, go to: **SQL Editor**
- [ ] **5.2** Click: **"New Query"**
- [ ] **5.3** Copy ALL content from `scripts/schema.sql`
- [ ] **5.4** Paste and Run
- [ ] **5.5** Create another new query
- [ ] **5.6** Copy ALL content from `scripts/setup.sql`
- [ ] **5.7** Paste and Run

---

### Phase 6: Configure Authentication

- [ ] **6.1** In Supabase Dashboard, go to: **Authentication** → **Providers**
- [ ] **6.2** Ensure **Email** provider is enabled (toggle ON)
- [ ] **6.3** Go to: **Authentication** → **URL Configuration**
- [ ] **6.4** Set **Site URL** to: `http://localhost:3000`
- [ ] **6.5** Click **Add URL** under "Redirect URLs"
- [ ] **6.6** Add these THREE URLs (one at a time):

  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/auth/verify-email
  http://localhost:3000/auth/reset-password
  ```

- [ ] **6.7** Click **Save** at the bottom

---

### Phase 7: Verify Database Tables

- [ ] **7.1** In Supabase Dashboard, go to: **Table Editor**
- [ ] **7.2** Verify these 8 tables exist:
  - [ ] ✅ users
  - [ ] ✅ students
  - [ ] ✅ questions
  - [ ] ✅ tasks
  - [ ] ✅ quiz_attempts
  - [ ] ✅ student_points
  - [ ] ✅ user_sessions
  - [ ] ✅ audit_logs

---

### Phase 8: Test Setup

- [ ] **8.1** Run setup checker:

  ```bash
  npm run check-setup
  ```

- [ ] **8.2** Verify all checks pass ✅
- [ ] **8.3** Fix any errors if shown

---

### Phase 9: Start Application

- [ ] **9.1** Start development server:

  ```bash
  npm run dev
  ```

- [ ] **9.2** Wait for "Ready" message
- [ ] **9.3** Open browser to: `http://localhost:3000`
- [ ] **9.4** Should see QuizSpark login page

---

### Phase 10: Create First User

- [ ] **10.1** Click: **"Create an account"**
- [ ] **10.2** Enter username (e.g., `admin`)
- [ ] **10.3** Enter your email
- [ ] **10.4** Click magic wand 🪄 to generate strong password
- [ ] **10.5** Copy the generated password and save it somewhere safe!
- [ ] **10.6** Click: **"Create account"**
- [ ] **10.7** Check your email inbox
- [ ] **10.8** Click verification link in email
- [ ] **10.9** You should be redirected and logged in! 🎉

---

### Phase 11: Verify Features

**Test each feature:**

- [ ] **11.1** Dashboard loads with statistics
- [ ] **11.2** Navigate to **Students** page
- [ ] **11.3** Add a test student:

  ```
  Name: John Doe
  Email: john@example.com
  Group: Class A
  ```

- [ ] **11.4** Navigate to **Questions** page
- [ ] **11.5** Add a test question:

  ```
  Question: What is 2 + 2?
  Options: 1, 2, 3, 4
  Correct: 4
  Topic: Math
  Difficulty: Easy
  ```

- [ ] **11.6** Navigate to **Quiz** page
- [ ] **11.7** Click "Select Student" and pick John Doe
- [ ] **11.8** Click "Start Quiz"
- [ ] **11.9** Answer the question
- [ ] **11.10** Verify points update
- [ ] **11.11** Check **Leaderboard** page
- [ ] **11.12** Test dark/light mode toggle

---

## 🎉 Completion

If all checkboxes are checked, your QuizSpark is fully operational!

### What You Should Have

✅ Fresh Supabase project configured  
✅ All database tables created  
✅ RLS policies applied  
✅ Authentication working  
✅ Local environment configured  
✅ Application running on localhost:3000  
✅ First user registered and verified  
✅ All features tested and working  

---

## 📊 Quick Health Check

Run these commands to verify everything:

```bash
# Check setup
npm run check-setup

# Should show: ✅ All checks passed!
```

```bash
# Start app
npm run dev

# Should show: ✓ Ready in X seconds
```

```bash
# Test in browser
# Should load: http://localhost:3000
```

---

## 🆘 Troubleshooting

### If any step fails

1. **Can't create Supabase project?**
   - Check you have a Supabase account
   - Verify email is confirmed
   - Check if you've exceeded free tier limits

2. **SQL script fails?**
   - Check if you copied ENTIRE script
   - Look at the error message in SQL Editor
   - Try running schema.sql and setup.sql separately

3. **App won't start?**
   - Run: `npm install` again
   - Delete `node_modules` and `.next` folders, then reinstall
   - Check `.env.local` has no extra spaces

4. **Can't login after registration?**
   - Check email verification link
   - Look in spam folder
   - Manually verify in Supabase Dashboard → Authentication → Users

5. **Tables are empty after SQL?**
   - Re-run the complete-setup.sql script
   - Check Supabase logs for errors
   - Verify you're looking at the correct project

---

## 📞 Need More Help?

- **Setup Guide:** `SETUP_GUIDE.md` (detailed instructions)
- **Quick Start:** `QUICK_START.md` (15-minute guide)
- **Check Setup:** `node scripts/check-setup.js` (automated checker)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## 🚀 Next Steps After Setup

1. **Customize branding** - Update logo and colors
2. **Add students** - Bulk import or add manually
3. **Create question bank** - Add questions for your subject
4. **Run your first quiz** - Test with students
5. **Explore analytics** - Check leaderboard and stats
6. **Deploy to production** - Use Vercel (see README.md)

---

**Happy Teaching! 🎓📚**

---

> 💡 **Pro Tip:** Print this checklist and mark items as you complete them. It makes tracking progress much easier!

> 🔖 **Bookmark:** Save your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
