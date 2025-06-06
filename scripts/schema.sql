-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create an enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'user');

-- Create an enum for auth providers
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'github', 'microsoft');

-- Create users table if it doesn't exist
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

-- Create user_sessions table to track login activity
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

-- Create audit_logs table for system-wide activity tracking
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

-- Create students table with enhanced metadata
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

-- Create questions table with enhanced metadata
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
    time_limit INTEGER, -- in seconds
    points INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create tasks table with enhanced metadata
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

-- Create quiz_attempts table to track student attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    question_id UUID REFERENCES questions(id) NOT NULL,
    selected_option INTEGER,
    is_correct BOOLEAN,
    time_taken INTEGER, -- in seconds
    points_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow trigger function to insert new users"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policies for user_sessions table
CREATE POLICY "Users can view their own sessions"
ON user_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for audit_logs table
CREATE POLICY "Users can view their own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for students table
CREATE POLICY "Users can view their own students"
ON students FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own students"
ON students FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
ON students FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
ON students FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for questions table
CREATE POLICY "Users can view their own questions"
ON questions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions"
ON questions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
ON questions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
ON questions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for tasks table
CREATE POLICY "Users can view assigned or created tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own or assigned tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for quiz_attempts table
CREATE POLICY "Users can view their own attempts"
ON quiz_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
ON quiz_attempts FOR INSERT36
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        metadata,
        ip_address
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE
            WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE'
            THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE
            WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE'
            THEN to_jsonb(NEW)
            ELSE NULL
        END,
        jsonb_build_object(
            'timestamp', CURRENT_TIMESTAMP,
            'session_id', (SELECT id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true LIMIT 1)
        ),
        inet_client_addr()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure role is lowercase before casting
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        is_email_verified,
        created_at,
        updated_at
    ) VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email),
        (COALESCE(LOWER(new.raw_user_meta_data->>'role'), 'user'))::user_role,
        new.email_confirmed_at IS NOT NULL,
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW())
    );
    RETURN new;
EXCEPTION
    WHEN others THEN
        -- Log the error details
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RAISE NOTICE 'Error detail: %', SQLSTATE;
        -- Re-raise the error
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Create function to handle user session management
CREATE OR REPLACE FUNCTION handle_user_session()
RETURNS TRIGGER AS $$
DECLARE
    device_info jsonb;
    location_info jsonb;
BEGIN
    -- Parse user agent
    device_info = jsonb_build_object(
        'browser', current_setting('request.headers')::jsonb->>'user-agent',
        'os', current_setting('request.headers')::jsonb->>'sec-ch-ua-platform'
    );
    
    -- Get location info from IP (simplified)
    location_info = jsonb_build_object(
        'ip', inet_client_addr()::text
    );

    -- Close any existing active sessions
    UPDATE user_sessions
    SET 
        ended_at = TIMEZONE('utc', NOW()),
        is_active = false
    WHERE 
        user_id = new.id 
        AND is_active = true;

    -- Create new session
    INSERT INTO user_sessions (
        user_id,
        ip_address,
        user_agent,
        device_info,
        location,
        started_at,
        is_active
    ) VALUES (
        new.id,
        inet_client_addr(),
        current_setting('request.headers')::jsonb->>'user-agent',
        device_info,
        location_info,
        TIMEZONE('utc', NOW()),
        true
    );

    -- Update user's last login
    UPDATE users
    SET 
        last_login_at = TIMEZONE('utc', NOW()),
        login_count = login_count + 1
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at columns
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

-- Create audit log triggers
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_students_changes
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_questions_changes
    AFTER INSERT OR UPDATE OR DELETE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_tasks_changes
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_quiz_attempts_changes
    AFTER INSERT OR UPDATE OR DELETE ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create trigger for user session management
CREATE OR REPLACE TRIGGER on_auth_user_login
    AFTER INSERT ON auth.sessions
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_session(); 