-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create a trigger to automatically create a user record when a new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add user_id column to questions table
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add user_id column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add Row Level Security (RLS) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Users can view their own students"
ON public.students FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own students"
ON public.students FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
ON public.students FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
ON public.students FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.students TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

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
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create student_points table
create table public.student_points (
    id uuid not null default extensions.uuid_generate_v4(),
    student_id uuid not null,
    points integer not null default 0,
    quiz_count integer not null default 0,
    correct_answers integer not null default 0,
    total_attempts integer not null default 0,
    rank integer null,
    metadata jsonb null default '{}'::jsonb,
    created_at timestamp with time zone null default timezone('utc'::text, now()),
    updated_at timestamp with time zone null default timezone('utc'::text, now()),
    constraint student_points_pkey primary key (id),
    constraint student_points_student_id_fkey foreign key (student_id) references students(id) on delete cascade,
    constraint student_points_student_id_unique unique (student_id)
);

-- Add RLS policies for student_points
alter table public.student_points enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view student points" on public.student_points;
drop policy if exists "Users can update their own student points" on public.student_points;
drop policy if exists "Users can insert student points for their students" on public.student_points;
drop policy if exists "student_points_select_policy" on public.student_points;
drop policy if exists "student_points_modify_policy" on public.student_points;

-- Create new policies for student_points
create policy "student_points_select_policy"
    on public.student_points for select
    to authenticated
    using (true);

create policy "student_points_insert_policy"
    on public.student_points for insert
    to authenticated
    with check (exists (
        select 1 from students
        where students.id = student_points.student_id
        and students.user_id = auth.uid()
    ));

create policy "student_points_update_policy"
    on public.student_points for update
    to authenticated
    using (exists (
        select 1 from students
        where students.id = student_points.student_id
        and students.user_id = auth.uid()
    ));

create policy "student_points_delete_policy"
    on public.student_points for delete
    to authenticated
    using (exists (
        select 1 from students
        where students.id = student_points.student_id
        and students.user_id = auth.uid()
    ));

-- Grant necessary permissions
grant all on public.student_points to authenticated;

-- Create function to update student ranks
create or replace function update_student_ranks()
returns trigger as $$
begin
    -- Update ranks for all students based on points
    with ranked_students as (
        select 
            id,
            row_number() over (order by points desc, correct_answers desc, quiz_count desc) as new_rank
        from public.student_points
    )
    update public.student_points sp
    set rank = rs.new_rank
    from ranked_students rs
    where sp.id = rs.id;
    
    return null;
end;
$$ language plpgsql;

-- Create trigger to update ranks when points change
create trigger update_student_ranks_trigger
after insert or update of points, correct_answers, quiz_count
on public.student_points
for each row
execute function update_student_ranks();

-- Create audit trigger for student_points
create trigger audit_student_points_changes
after insert or delete or update
on public.student_points
for each row
execute function log_audit_event();

-- Add RLS policies for quiz_attempts table
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view quiz attempts
CREATE POLICY "quiz_attempts_select_policy"
ON quiz_attempts FOR SELECT
TO authenticated
USING (true);

-- Users can insert quiz attempts (modified to allow insertion with user_id)
CREATE POLICY "quiz_attempts_insert_policy"
ON quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM students s
        WHERE s.user_id = auth.uid()
        AND s.id = (quiz_attempts.metadata->>'student_id')::uuid
    )
);

-- Users can update their own quiz attempts
CREATE POLICY "quiz_attempts_update_policy"
ON quiz_attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own quiz attempts
CREATE POLICY "quiz_attempts_delete_policy"
ON quiz_attempts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON quiz_attempts TO authenticated;

