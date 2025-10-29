# QuizSpark Scripts Directory

This directory contains all database setup scripts and utilities for QuizSpark, organized into subdirectories for better maintainability.

## 📁 Directory Structure

```
scripts/
├── complete-setup.sql          # 🚀 Main setup file (run this first!)
├── database/                   # Database schema and setup scripts
│   ├── 01-schema.sql          # Core database schema (tables, functions, triggers)
│   ├── 02-setup.sql           # Additional setup (RLS policies, permissions)
│   ├── 03-clean-schema.sql    # Cleanup script (drops all tables/functions)
│   ├── 04-update-schema.sql   # Schema update/migration script
│   └── 05-fix-user-trigger.sql # Fix for user registration trigger
├── test/                       # Test and sample data
│   └── 01-sample-data.sql     # Sample data generator (students, questions, tasks)
└── utils/                      # Utility scripts
    ├── 01-check-setup.js      # Setup verification script
    ├── 02-apply-schema.ts     # Apply schema programmatically
    ├── 03-reset-db.ts         # Reset database to clean state
    ├── 04-update-schema.ts    # Run schema updates
    ├── 05-sync-with-supabase.ts # Sync local JSON with Supabase
    └── tsconfig.json          # TypeScript configuration
```

## 🚀 Quick Start

### For First-Time Setup

**Option 1: Using Supabase SQL Editor (Recommended)**

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of **`complete-setup.sql`**
4. Click "Run" to execute

**Option 2: Using Command Line**

```bash
# Run the complete setup
psql -h your-db-host -U postgres -d your-db-name -f complete-setup.sql
```

### For Testing with Sample Data

After setting up the database and registering at least one user:

```bash
# In Supabase SQL Editor, run:
scripts/test/01-sample-data.sql
```

This will create:
- 20 sample students across 3 groups
- 30 sample questions (Math, Science, History, English)
- 10 sample tasks with various priorities
- Student points and quiz attempts

## 📂 Directory Details

### `/database` - Database Schema Scripts

These scripts define your database structure:

- **01-schema.sql** - The foundation
  - Creates all tables (users, students, questions, tasks, etc.)
  - Defines user roles and enums
  - Sets up triggers and functions
  - Configures Row Level Security (RLS)

- **02-setup.sql** - Additional configuration
  - Enhanced RLS policies
  - User registration and session handling
  - Authentication permissions

- **03-clean-schema.sql** - Cleanup utility
  - Safely drops all database objects
  - Use when you need a fresh start
  - ⚠️ WARNING: This deletes all data!

- **04-update-schema.sql** - Schema migrations
  - Add student_points table
  - Update RLS policies
  - Add new features to existing tables

- **05-fix-user-trigger.sql** - Troubleshooting
  - Fixes user registration issues
  - Syncs auth.users with public.users
  - Includes verification checks

### `/test` - Test & Sample Data

- **01-sample-data.sql** - Comprehensive test data
  - Realistic student profiles
  - Educational questions across subjects
  - Sample tasks and quiz attempts
  - Great for development and demo purposes

### `/utils` - Utility Scripts

Helper scripts for database management:

- **01-check-setup.js** - Verification tool
  ```bash
  node scripts/utils/01-check-setup.js
  ```
  Checks:
  - Environment file existence
  - Required environment variables
  - Dependencies installation
  - Required files

- **02-apply-schema.ts** - Schema applier
  ```bash
  npx tsx scripts/utils/02-apply-schema.ts
  ```
  Programmatically applies schema.sql to your database

- **03-reset-db.ts** - Database reset
  ```bash
  npx tsx scripts/utils/03-reset-db.ts
  ```
  ⚠️ Completely resets your database (clean + schema)

- **04-update-schema.ts** - Update runner
  ```bash
  npx tsx scripts/utils/04-update-schema.ts
  ```
  Runs schema updates/migrations

- **05-sync-with-supabase.ts** - Sync utility
  ```bash
  npx tsx scripts/utils/05-sync-with-supabase.ts
  ```
  Syncs local JSON database with Supabase

## 📋 Common Tasks

### Setting Up a Fresh Database

1. Run `complete-setup.sql` in Supabase SQL Editor
2. Configure your `.env.local` with Supabase credentials
3. Run `npm run dev` and register your first user
4. (Optional) Run `test/01-sample-data.sql` for test data

### Resetting the Database

```bash
# Option 1: Manual (Supabase SQL Editor)
# 1. Run database/03-clean-schema.sql
# 2. Run database/01-schema.sql
# 3. Run database/02-setup.sql

# Option 2: Using utility script
npx tsx scripts/utils/03-reset-db.ts
```

### Updating Schema

```bash
# Apply updates
npx tsx scripts/utils/04-update-schema.ts

# Or manually in Supabase SQL Editor
# Run: database/04-update-schema.sql
```

### Checking Setup

```bash
node scripts/utils/01-check-setup.js
```

### Fixing User Registration Issues

If users aren't being created in `public.users`:

```bash
# In Supabase SQL Editor, run:
database/05-fix-user-trigger.sql
```

## 🔐 Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📝 Notes

- **Always backup before running destructive operations!**
- The `complete-setup.sql` file at root contains the full setup for convenience
- All scripts maintain exact content from the original setup
- Numbered prefixes (01, 02, etc.) indicate recommended execution order
- SQL scripts can be run directly in Supabase SQL Editor
- TypeScript scripts require `tsx` or compilation: `npx tsx script-name.ts`

## 🆘 Troubleshooting

### Users not appearing in public.users table
Run `database/05-fix-user-trigger.sql`

### Need to start fresh
Run `database/03-clean-schema.sql` then `complete-setup.sql`

### Environment variables not found
Run `scripts/utils/01-check-setup.js` to verify setup

### TypeScript errors
Make sure you have `tsx` installed: `npm install -D tsx`

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** November 2025
**QuizSpark Version:** 1.0.0

