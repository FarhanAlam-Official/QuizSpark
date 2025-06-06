-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'user');
    END IF;
END $$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_session();

-- Create or replace the handle_new_user function
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
        RAISE LOG 'Error detail: %', SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the handle_user_session function
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
    
    -- Create new session record
    INSERT INTO public.user_sessions (
        user_id,
        ip_address,
        user_agent,
        device_info,
        location,
        started_at,
        is_active
    ) VALUES (
        NEW.user_id,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent',
        jsonb_build_object(
            'browser', current_setting('request.headers', true)::json->>'user-agent'
        ),
        jsonb_build_object(
            'ip', inet_client_addr()::text
        ),
        NOW(),
        true
    );
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_user_session: %', SQLERRM;
        RAISE LOG 'Error detail: %', SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_login
    AFTER INSERT ON auth.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_session();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
    -- Users table policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    DROP POLICY IF EXISTS "Allow new user registration" ON public.users;
    DROP POLICY IF EXISTS "Allow service role full access" ON public.users;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
    
    -- Sessions table policies
    DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "Service role can manage sessions" ON public.user_sessions;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Create policies for users table
CREATE POLICY "Enable read access for authenticated users"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow new user registration"
    ON public.users
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow service role full access"
    ON public.users
    FOR ALL
    TO service_role
    USING (true);

-- Create policies for user_sessions table
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON public.user_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage sessions"
    ON public.user_sessions
    FOR ALL
    TO service_role
    USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.users TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure auth schema permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT SELECT ON auth.users TO anon, authenticated, service_role;
GRANT SELECT ON auth.sessions TO anon, authenticated, service_role;

-- Reset all sessions (optional - uncomment if you want to force all users to re-login)
-- UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data - 'session';
-- DELETE FROM auth.sessions; 