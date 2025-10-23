-- Manual Admin Setup - Step by Step
-- Run each section separately in your Supabase SQL Editor

-- STEP 1: Check existing users
-- Run this first to see what users exist
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- STEP 2: Create admin profile using a specific user ID
-- Replace 'USER_ID_HERE' with the actual ID from Step 1
-- Example: INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
-- VALUES ('12345678-1234-1234-1234-123456789012', 'ADMIN001', 'Admin', 'User', 'admin@hub.com', 'admin');

INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID from Step 1
    'ADMIN001',
    'Admin',
    'User',
    'admin@hub.com',  -- Replace with your actual email
    'admin'::user_role
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin'::user_role;

-- STEP 3: Create permissive event policies
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage events" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);

-- STEP 4: Verify setup
SELECT 
    p.id,
    p.email,
    p.role,
    p.college_id
FROM public.profiles p
WHERE p.role = 'admin';

-- STEP 5: Test event creation permissions
SELECT 
    'Can create events' as test,
    COUNT(*) > 0 as has_policy
FROM pg_policies 
WHERE tablename = 'events' AND cmd = 'ALL';
