-- First, drop the existing trigger and function to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with proper handling of user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        is_email_verified,
        created_at,
        updated_at,
        is_active,
        login_count,
        preferences
    ) VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email),
        (COALESCE(new.raw_user_meta_data->>'role', 'user'))::user_role,
        new.email_confirmed_at IS NOT NULL,
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW()),
        true,
        0,
        '{}'::jsonb
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow trigger function to insert new users" ON users;

-- Recreate policies with proper permissions
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- Verify the user_role type exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'user');
    END IF;
END $$; 