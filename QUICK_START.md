# 🚀 QuizSpark Quick Start Guide

> **Your Supabase project was deleted? No problem!** Follow this guide to get back up and running in **15 minutes**.

---

## ⚡ Super Quick Setup (TL;DR)

```bash
# 1. Create new Supabase project at https://supabase.com
# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Install dependencies
npm install

# 4. Apply database schema (copy/paste in Supabase SQL Editor):
#    - scripts/schema.sql
#    - scripts/setup.sql

# 5. Check your setup
node scripts/check-setup.js

# 6. Start the app
npm run dev

# 7. Open http://localhost:3000 and register!
```

---

## 📝 Detailed Steps

### **Step 1: Create Supabase Project** (3 minutes)

1. Go to: **https://supabase.com/dashboard**
2. Click: **"New Project"**
3. Enter:
   - Name: `QuizSpark`
   - Password: (create a strong one)
   - Region: (choose closest)
4. Click: **"Create new project"**
5. ⏳ Wait 2-3 minutes for provisioning

---

### **Step 2: Get Your API Keys** (2 minutes)

1. In Supabase Dashboard, click: **Settings** (gear icon) → **API**
2. Copy these THREE values:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGc...
service_role: eyJhbGc... (click "Reveal" first)
```

---

### **Step 3: Configure Environment** (2 minutes)

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and paste your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

### **Step 4: Set Up Database** (5 minutes)

1. In Supabase Dashboard, go to: **SQL Editor** (left sidebar)
2. Click: **"New Query"**
3. Open `scripts/schema.sql` from your project
4. **Copy ALL content** → Paste in SQL Editor
5. Click: **"Run"** (or Ctrl+Enter)
6. ✅ Wait for success message

7. **Repeat for setup.sql:**
   - Create another new query
   - Open `scripts/setup.sql`
   - Copy → Paste → Run

---

### **Step 5: Configure Authentication** (2 minutes)

1. In Supabase Dashboard: **Authentication** → **URL Configuration**
2. Set **Site URL:** `http://localhost:3000`
3. Add **Redirect URLs:**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/verify-email
   http://localhost:3000/auth/reset-password
   ```
4. Click **Save**

---

### **Step 6: Install & Start** (1 minute)

```bash
# Install dependencies
npm install

# Check if everything is configured correctly
node scripts/check-setup.js

# Start the development server
npm run dev
```

---

### **Step 7: Create Your First User** (1 minute)

1. Open: **http://localhost:3000**
2. You'll be redirected to Login page
3. Click: **"Create an account"**
4. Fill in the form:
   - Username: `admin`
   - Email: `your-email@example.com`
   - Password: (use the magic wand 🪄 to generate)
5. Click: **"Create account"**
6. Check your email for verification link
7. Click the link → You're in! 🎉

---

## ✅ Verify Everything Works

Test these features:

```bash
✅ Login/Logout
✅ Add a student
✅ Add a question
✅ Start a quiz
✅ Pick random student
✅ View dashboard stats
```

---

## 🔧 Troubleshooting

### ❌ "Invalid API Key"
- Check `.env.local` for typos
- Restart dev server: `Ctrl+C` then `npm run dev`
- Ensure no extra spaces in the keys

### ❌ "Failed to create user"
- Database schema not applied correctly
- Go to Supabase → SQL Editor
- Re-run both `schema.sql` and `setup.sql`

### ❌ "Email not verified"
- Check spam folder
- Or manually verify in Supabase:
  - Dashboard → Authentication → Users
  - Click user → "Confirm email"

### ❌ Database tables missing
Run this in SQL Editor to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
Should show: users, students, questions, tasks, quiz_attempts, student_points, user_sessions, audit_logs

---

## 📊 Expected Database Structure

After setup, you should have:

| Table | Description |
|-------|-------------|
| **users** | User accounts |
| **students** | Student records |
| **questions** | Quiz questions |
| **tasks** | Task assignments |
| **quiz_attempts** | Quiz history |
| **student_points** | Points tracking |
| **user_sessions** | Session logs |
| **audit_logs** | Audit trail |

---

## 🎯 What's Next?

1. **Add Students:** Go to `/students` and add your first student
2. **Create Questions:** Go to `/questions` and create quiz questions
3. **Start Quiz:** Go to `/quiz` and test the interactive quiz
4. **Check Leaderboard:** See student rankings

---

## 📚 Additional Help

- **Full Setup Guide:** See `SETUP_GUIDE.md`
- **Check Configuration:** Run `node scripts/check-setup.js`
- **Supabase Docs:** https://supabase.com/docs
- **Project README:** See `README.md`

---

## 🎉 Success!

You should now have QuizSpark running with:
- ✅ Fresh Supabase database
- ✅ All tables and policies configured
- ✅ Authentication working
- ✅ Ready to use!

**Happy Teaching! 🎓**

---

> **Pro Tip:** Bookmark your Supabase dashboard URL for easy access to logs, database, and auth management.

