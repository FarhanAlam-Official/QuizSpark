# 🎯 What You Need To Do - Simple Version

> **You deleted your Supabase project. Here's the fastest way to fix it:**

---

## 🚀 **3 Main Steps** (15 minutes total)

### **STEP 1: Create New Supabase Project** (5 minutes)

1. Go here: **https://supabase.com/dashboard**
2. Click **"New Project"**
3. Name it: **QuizSpark**
4. Create password & select region
5. Wait 2 minutes

---

### **STEP 2: Copy Credentials to Your Project** (3 minutes)

1. In Supabase Dashboard: **Settings** → **API**
2. Copy these 3 things:
   - Project URL
   - anon public key
   - service_role key (click "Reveal" first)

3. In your QuizSpark folder, create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=paste-your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-service-key-here
```

---

### **STEP 3: Set Up Database** (5 minutes)

1. In Supabase Dashboard: **SQL Editor** → **New Query**
2. Open file: `scripts/complete-setup.sql` from your project
3. Copy EVERYTHING from that file
4. Paste into SQL Editor
5. Click **"Run"**
6. Wait for "Success" ✅

---

### **STEP 4: Configure Auth** (2 minutes)

1. In Supabase: **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/verify-email
   http://localhost:3000/auth/reset-password
   ```
4. Click **Save**

---

## ✅ **That's It! Now Start Your App:**

```bash
# Install dependencies
npm install

# Check if everything is set up correctly
npm run check-setup

# Start the app
npm run dev
```

Open: **http://localhost:3000**

---

## 🎉 **First Time Using the App:**

1. Click **"Create an account"**
2. Fill in username, email, password
3. Check email for verification link
4. Click the link
5. You're in! Start adding students and questions

---

## 📚 **Need More Details?**

I created several guides for you:

| File | What's Inside | When to Use |
|------|--------------|-------------|
| **`QUICK_START.md`** | 15-minute setup guide | Read this first! |
| **`SETUP_CHECKLIST.md`** | Step-by-step checklist | Mark items as you go |
| **`SETUP_GUIDE.md`** | Detailed instructions | If you get stuck |
| **`scripts/complete-setup.sql`** | Database setup (all-in-one) | Run in Supabase SQL Editor |
| **`scripts/check-setup.js`** | Setup verification script | Run: `npm run check-setup` |

---

## 🔧 **What I Created For You:**

✅ Complete setup guide with screenshots descriptions  
✅ Step-by-step checklist (100+ items)  
✅ Single SQL file with everything combined  
✅ Setup verification script  
✅ Environment variables template  
✅ Quick troubleshooting guide  
✅ New npm scripts: `check-setup` and `setup`  

---

## 💡 **Super Quick Setup Commands:**

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your Supabase credentials
# (use your text editor)

# 3. Install dependencies
npm install

# 4. Verify setup
npm run check-setup

# 5. Start app
npm run dev
```

**Don't forget:** Run the SQL in Supabase SQL Editor!

---

## ❓ **Common Questions:**

**Q: Which SQL file should I use?**  
A: Use `scripts/complete-setup.sql` - it has everything in one file!

**Q: Do I need to create tables manually?**  
A: No! The SQL script creates all 8 tables automatically.

**Q: What about my old data?**  
A: Unfortunately, if you deleted the Supabase project, the data is gone. You'll need to re-add students and questions.

**Q: Can I use a different database?**  
A: QuizSpark is built for Supabase. Switching to another database would require significant code changes.

**Q: Is this free?**  
A: Yes! Supabase free tier is sufficient for QuizSpark.

---

## 🎯 **Fastest Path (For Experienced Developers):**

```bash
# 1. Create Supabase project → Get credentials
# 2. Create .env.local with credentials
cp .env.example .env.local && nano .env.local

# 3. Install & verify
npm install && npm run check-setup

# 4. Run SQL script in Supabase Dashboard
#    File: scripts/complete-setup.sql

# 5. Configure Auth URLs in Supabase

# 6. Start
npm run dev
```

---

## 📞 **Still Stuck?**

1. Run the setup checker:
   ```bash
   npm run check-setup
   ```
   It will tell you exactly what's missing!

2. Read `QUICK_START.md` - it has pictures/descriptions of every step

3. Check `SETUP_CHECKLIST.md` - tick off items as you complete them

---

## 🎊 **After Setup:**

Your app will have:
- ✅ Fresh database with all tables
- ✅ User authentication working
- ✅ No data (you'll add students & questions)
- ✅ All features functional

Start by:
1. Creating your first user account
2. Adding students
3. Adding quiz questions
4. Running your first quiz!

---

**Let's get started! 🚀**

**Estimated total time: 15-20 minutes**

