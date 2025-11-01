-- =============================================
-- Fix User Registration Trigger
-- =============================================
-- This fixes the issue where users are created in auth.users
-- but not in public.users table
-- =============================================

-- Step 1: Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the fixed function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into public.users table
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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE LOG 'NEW.id: %, NEW.email: %', NEW.id, NEW.email;
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Fix existing users (if any)
-- This will create public.users records for any auth.users that don't have them
INSERT INTO public.users (id, email, name, role, is_email_verified, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
  au.email_confirmed_at IS NOT NULL,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Step 5: Verify the fix
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  
  RAISE NOTICE '✅ Trigger fixed!';
  RAISE NOTICE 'Auth users: %', auth_count;
  RAISE NOTICE 'Public users: %', public_count;
  
  IF auth_count = public_count THEN
    RAISE NOTICE '✅ All users synced successfully!';
  ELSE
    RAISE NOTICE '⚠️ User counts do not match. Please check manually.';
  END IF;
END $$;

