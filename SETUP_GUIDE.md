# QuizSpark Setup Guide - Recreating Supabase Project

## 📋 Prerequisites

- Node.js 18.x or later installed
- Git installed
- A Supabase account (free tier works fine)
- An email service account (Brevo - optional for OTP emails)

---

## 🚀 Step-by-Step Setup

### **Step 1: Create New Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Click **"New Project"**
4. Fill in the details:
   - **Name:** QuizSpark (or any name you prefer)
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is sufficient
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be provisioned

---

### **Step 2: Get Your Supabase Credentials**

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** section
3. Copy and save these values:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) - Click "Reveal" to see it

---

### **Step 3: Set Up Database Schema**

#### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Open the `scripts/schema.sql` file from your QuizSpark project
4. Copy the ENTIRE contents
5. Paste into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter`
7. Wait for it to complete (you should see "Success" message)

8. Create a new query and repeat with `scripts/setup.sql`
   - Copy contents of `scripts/setup.sql`
   - Paste into SQL Editor
   - Click **"Run"**

#### Option B: Using Command Line (Advanced)

```bash
# Navigate to your project
cd path/to/QuizSpark

# Install dependencies if not already installed
npm install

# Apply the schema
npm run db:schema
```

---

### **Step 4: Configure Environment Variables**

1. In your QuizSpark project root, create a `.env.local` file:

```bash
# Create the file
touch .env.local
```

2. Open `.env.local` and add the following:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email Configuration (OPTIONAL - for OTP emails)
BREVO_API_KEY=your-brevo-api-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Replace the placeholder values with your actual Supabase credentials from Step 2

---

### **Step 5: Configure Supabase Authentication**

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure Email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize if needed (optional)

4. Set up Site URL and Redirect URLs:
   - Go to **Authentication** → **URL Configuration**
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** Add these:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/verify-email`
     - `http://localhost:3000/auth/reset-password`
     - For production, add your deployed URLs

5. **IMPORTANT:** Enable Email Confirmations
   - Go to **Authentication** → **Providers** → **Email**
   - Toggle **"Confirm email"** to ON
   - This enables email verification for new users

---

### **Step 6: Test Database Connection**

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open browser to `http://localhost:3000`

4. Test API connection:
   - Navigate to `http://localhost:3000/api/test-env`
   - You should see your environment variables (anon key only)

---

### **Step 7: Create Your First User**

1. Go to `http://localhost:3000/auth/register`
2. Fill in the registration form:
   - Username
   - Email
   - Password (use the password generator for a strong one)
3. Click **"Create account"**
4. Check your email for verification link
5. Click the verification link
6. You'll be redirected and logged in automatically
7. You should now see the Dashboard!

---

### **Step 8: Verify Database Tables**

1. Go to Supabase Dashboard → **Table Editor**
2. You should see these tables:
   - ✅ users
   - ✅ students
   - ✅ questions
   - ✅ tasks
   - ✅ quiz_attempts
   - ✅ student_points
   - ✅ user_sessions
   - ✅ audit_logs

3. Check the `users` table - your registered user should be there

---

## 🎯 Quick Test Checklist

After setup, test these features:

- [ ] Register a new user
- [ ] Verify email
- [ ] Log in
- [ ] Add a student
- [ ] Add a question
- [ ] Start a quiz
- [ ] Pick a random student
- [ ] View leaderboard
- [ ] Update profile

---

## 🔍 Troubleshooting

### Issue: "Invalid API Key" or "Failed to fetch"

**Solution:**

- Double-check your `.env.local` file
- Ensure no extra spaces in the keys
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: "Failed to create user" during registration

**Solution:**

- Check if the `schema.sql` was applied correctly
- Go to Supabase Dashboard → SQL Editor
- Run this query to check:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

- You should see all 8 tables listed

### Issue: Email verification not working

**Solution:**

- Check Supabase Dashboard → Authentication → Email Templates
- Ensure "Confirm email" is enabled
- Check your email spam folder
- For development, you can manually verify users in Supabase Dashboard:
  - Go to Authentication → Users
  - Click on the user
  - Click "Confirm email"

### Issue: "Row Level Security" policy violation

**Solution:**

- The RLS policies might not have been applied
- Re-run `scripts/setup.sql` in SQL Editor
- Or temporarily disable RLS (NOT RECOMMENDED for production):

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
```

### Issue: Database connection errors

**Solution:**

- Verify your Supabase project is active (not paused)
- Check Project Settings → Database → Connection Info
- Ensure your database password is correct

---

## 📱 Optional: Email Service Setup (Brevo)

If you want OTP emails to work:

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Create a free account
3. Go to Settings → API Keys
4. Generate a new API key
5. Add to `.env.local`:

```env
BREVO_API_KEY=your-key-here
```

**Note:** Email verification works through Supabase by default, so Brevo is optional.

---

## 🌐 Deployment Configuration

When deploying to production (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `BREVO_API_KEY` (optional)

2. Update Supabase Authentication URLs:
   - Go to Authentication → URL Configuration
   - Add your production URLs:
     - `https://your-domain.com/auth/callback`
     - `https://your-domain.com/auth/verify-email`
     - `https://your-domain.com/auth/reset-password`

3. Update `.env.local` → `NEXT_PUBLIC_APP_URL` to your production URL

---

## 🎉 Success

Your QuizSpark application should now be fully functional with:

- ✅ User authentication
- ✅ Student management
- ✅ Question bank
- ✅ Interactive quizzes
- ✅ Leaderboard
- ✅ Task management

---

## 📚 Additional Resources

- **Supabase Documentation:** <https://supabase.com/docs>
- **Next.js Documentation:** <https://nextjs.org/docs>
- **QuizSpark Repository:** Check the README.md for more info

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for errors (F12 → Console)
2. Check the terminal for server errors
3. Review Supabase logs in Dashboard → Logs
4. Create an issue on GitHub (if applicable)

---

**Created by:** Farhan Alam  
**Last Updated:** November 2025  
**Version:** 2.0.0
