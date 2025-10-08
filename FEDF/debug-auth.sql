-- Debug Authentication - Run this in Supabase SQL Editor
-- This will help you see what users exist and create a test admin user

-- 1. First, check what users exist in auth.users
SELECT id, email, created_at FROM auth.users;

-- 2. Check what profiles exist
SELECT * FROM public.profiles;

-- 3. If you see a user in auth.users but no profile, run this:
-- (Replace 'your-actual-user-id' with the ID from step 1)

-- INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
-- VALUES (
--     'your-actual-user-id-from-auth-users',
--     'ADMIN001',
--     'Admin',
--     'User',
--     'admin@hub.com',
--     'admin'
-- );

-- 4. Alternative: Create a student profile
-- INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
-- VALUES (
--     'your-actual-user-id-from-auth-users',
--     'STU001',
--     'Test',
--     'Student',
--     'your-email@example.com',
--     'student'
-- );
