# 🔧 QuizSpark Troubleshooting Guide

## ❌ Issue: Registration Works But Login Fails

### Symptoms:
- ✅ User can register
- ✅ Verification email is sent
- ❌ Email verification fails with "Verification Failed" error
- ❌ User exists in `auth.users` but NOT in `public.users` table
- ❌ Cannot login after email verification

### Root Cause:
The database trigger that automatically creates a user record in `public.users` when someone registers is not working correctly.

---

## 🚀 Quick Fix

### Step 1: Run the Fix Script

1. Open Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the ENTIRE contents of `scripts/fix-user-trigger.sql`
4. Paste into SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for success message

You should see:
```
✅ Trigger fixed!
Auth users: X
Public users: X
✅ All users synced successfully!
```

### Step 2: Delete the Failed User (Optional)

If you have test users that failed to register properly:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user(s) with issues
3. Click the three dots (...) → **Delete User**
4. Confirm deletion

### Step 3: Test Registration Again

1. Go to `http://localhost:3000/auth/register`
2. Register with a NEW email address
3. Check your email for verification link
4. Click the verification link
5. You should now be redirected and logged in successfully!

### Step 4: Verify Everything Works

Check both tables in Supabase Dashboard:

**Table 1: Authentication → Users**
- Should show your user

**Table 2: Table Editor → users**
- Should also show the same user

If both tables have the user, you're good to go! ✅

---

## 🔍 Understanding the Issue

### What Should Happen:

```
User Registers
    ↓
Record created in auth.users
    ↓
Trigger fires: handle_new_user()
    ↓
Record created in public.users
    ↓
Email verification sent
    ↓
User verifies email
    ↓
Login successful ✅
```

### What Was Happening (Bug):

```
User Registers
    ↓
Record created in auth.users
    ↓
Trigger fails or doesn't fire ❌
    ↓
NO record in public.users ❌
    ↓
Email verification sent
    ↓
User verifies email
    ↓
Login fails (no user in public.users) ❌
```

### Why the Trigger Failed:

Common reasons:
1. **Missing permissions** - Trigger doesn't have proper grants
2. **Search path issue** - Function can't find the public schema
3. **Conflict handling** - Trigger errors on duplicate entries
4. **SECURITY DEFINER** not set - Function runs without proper privileges

The fix script addresses all these issues.

---

## 🛠️ Manual Verification

### Check if Trigger Exists:

Run this in SQL Editor:
```sql
SELECT tgname, tgrelid::regclass, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
```

Should return:
```
tgname               | tgrelid    | proname
---------------------|------------|------------------
on_auth_user_created | auth.users | handle_new_user
```

### Check if Function Exists:

```sql
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
```

Should return the function details.

### Test the Trigger Manually:

```sql
-- Get a user from auth.users that's not in public.users
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- Manually insert them (replace the UUID and email)
INSERT INTO public.users (id, email, name, role)
VALUES (
  'UUID-FROM-ABOVE',
  'email@example.com',
  'Test User',
  'user'::user_role
);
```

---

## 🔍 Other Common Issues

### Issue: "Invalid API Key" Error

**Solution:**
```bash
# Check your .env.local file
cat .env.local

# Ensure no extra spaces or quotes
# Restart dev server
npm run dev
```

### Issue: "Failed to fetch" Error

**Solution:**
```bash
# Check if Supabase project is active
# Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
# Check browser console for CORS errors
```

### Issue: Email Not Sending

**Solution:**
1. Check Supabase Dashboard → **Authentication** → **Email Templates**
2. Ensure email provider is configured
3. Check spam folder
4. For development, manually verify users in Supabase Dashboard

### Issue: "Row Level Security" Policy Error

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Re-run setup.sql if needed
```

### Issue: Can't Add Students/Questions

**Solution:**
1. Ensure you're logged in
2. Check browser console for errors
3. Verify RLS policies are applied:
```sql
-- Check policies for students table
SELECT * FROM pg_policies WHERE tablename = 'students';
```

### Issue: Quiz Not Working

**Symptoms:**
- Can't select student
- Questions don't load
- Points not updating

**Solution:**
1. Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

2. Should see:
   - audit_logs
   - questions
   - quiz_attempts
   - student_points
   - students
   - tasks
   - user_sessions
   - users

3. If missing, re-run `scripts/complete-setup.sql`

---

## 📊 Database Health Check

Run this comprehensive check:

```sql
-- Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check triggers
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check user count sync
SELECT 
  'auth.users' as table_name,
  COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
  'public.users' as table_name,
  COUNT(*) as user_count
FROM public.users;
```

Expected results:
- ✅ 8 tables in public schema
- ✅ All tables have RLS enabled
- ✅ Multiple triggers exist
- ✅ User counts match between auth.users and public.users

---

## 🔄 Reset Everything (Nuclear Option)

If nothing else works, you can reset the entire database:

### ⚠️ WARNING: This deletes ALL data!

```sql
-- Drop all tables
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.student_points CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_session();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop types
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS auth_provider;

-- Now re-run scripts/complete-setup.sql
```

Then:
1. Run `scripts/complete-setup.sql`
2. Delete all users from Authentication → Users
3. Register a new user
4. Test everything

---

## 🆘 Still Having Issues?

### Checklist:

- [ ] `.env.local` file exists with correct credentials
- [ ] No extra spaces in environment variables
- [ ] Supabase project is not paused
- [ ] Database is accessible
- [ ] All 8 tables exist in public schema
- [ ] RLS is enabled on all tables
- [ ] Triggers are installed
- [ ] `handle_new_user` function exists
- [ ] User count matches between auth.users and public.users
- [ ] Email verification is enabled in Supabase Auth settings

### Get Help:

1. Check Supabase Dashboard → **Logs** for errors
2. Check browser console (F12) for JavaScript errors
3. Check terminal for server errors
4. Review this troubleshooting guide
5. Check `SETUP_GUIDE.md` for detailed setup instructions

---

## 📝 Prevention Tips

### After Setup:

1. **Test immediately** - Register a test user right after setup
2. **Verify tables** - Check that both auth.users and public.users have the user
3. **Backup regularly** - Export your database periodically
4. **Monitor logs** - Check Supabase logs for errors
5. **Use check-setup** - Run `npm run check-setup` regularly

### Before Deploying:

1. Test registration flow completely
2. Test login/logout
3. Test all CRUD operations (Create, Read, Update, Delete)
4. Verify RLS policies work
5. Test with multiple users
6. Check performance with sample data

---

## 🎯 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Registration fails | Run `fix-user-trigger.sql` |
| Login fails | Check if user exists in both tables |
| Email not verified | Manually verify in Supabase Dashboard |
| Can't add students | Check RLS policies |
| Quiz not working | Verify all tables exist |
| API errors | Check `.env.local` and restart server |
| Database errors | Check Supabase logs |

---

**Remember:** After any database changes, always test with a fresh user registration!

---

**Last Updated:** November 2025  
**Version:** 2.0.0

