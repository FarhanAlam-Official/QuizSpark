-- =============================================
-- QuizSpark Complete Database Setup
-- =============================================
-- This file combines schema.sql and setup.sql
-- Run this ONCE in Supabase SQL Editor to set up everything
-- =============================================

-- Step 1: Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'user');
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'github', 'microsoft');

-- =============================================
-- TABLES
-- =============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    group_name TEXT,
    score INTEGER DEFAULT 0,
    participation INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    tags TEXT[],
    explanation TEXT,
    time_limit INTEGER,
    points INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    question_id UUID REFERENCES questions(id) NOT NULL,
    selected_option INTEGER,
    is_correct BOOLEAN,
    time_taken INTEGER,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Student Points Table
CREATE TABLE IF NOT EXISTS student_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) NOT NULL UNIQUE,
    points INTEGER DEFAULT 0,
    quiz_count INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow new user registration"
    ON public.users FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow service role full access"
    ON public.users FOR ALL
    TO service_role
    USING (true);

-- Students Table Policies
CREATE POLICY "Users can view their own students"
    ON public.students FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create students"
    ON public.students FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own students"
    ON public.students FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own students"
    ON public.students FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Questions Table Policies
CREATE POLICY "Users can view their own questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create questions"
    ON public.questions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own questions"
    ON public.questions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own questions"
    ON public.questions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Tasks Table Policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Quiz Attempts Policies
CREATE POLICY "Users can view their own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create quiz attempts"
    ON public.quiz_attempts FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Student Points Policies
CREATE POLICY "Users can view student points"
    ON public.student_points FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert student points"
    ON public.student_points FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update student points"
    ON public.student_points FOR UPDATE
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

-- User Sessions Policies
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON public.user_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage sessions"
    ON public.user_sessions FOR ALL
    TO service_role
    USING (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        is_email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Handle user session
CREATE OR REPLACE FUNCTION public.handle_user_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user login stats
    UPDATE public.users
    SET 
        last_login_at = NOW(),
        login_count = COALESCE(login_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_user_session: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers (if any)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Trigger: On new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger: On user login
CREATE TRIGGER on_auth_user_login
    AFTER INSERT ON auth.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_session();

-- Triggers: Update timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- GRANTS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.users TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ QuizSpark database setup completed successfully!';
    RAISE NOTICE 'Tables created: users, students, questions, tasks, quiz_attempts, student_points, user_sessions, audit_logs';
    RAISE NOTICE 'RLS policies enabled and configured';
    RAISE NOTICE 'Triggers and functions installed';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure your .env.local file with Supabase credentials';
    RAISE NOTICE '2. Set up Authentication URLs in Supabase Dashboard';
    RAISE NOTICE '3. Run: npm run dev';
    RAISE NOTICE '4. Register your first user at http://localhost:3000/auth/register';
END $$;

