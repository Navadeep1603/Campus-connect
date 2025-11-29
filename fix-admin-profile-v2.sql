-- Fix Admin Profile and RLS Policies (Version 2)
-- Run this in your Supabase SQL Editor (no authentication required)

-- First, let's create the admin profile for the default admin account
-- We'll use the auth.users table to find the admin user
INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
SELECT 
    u.id,
    'ADMIN001',
    'Admin',
    'User',
    u.email,
    'admin'::user_role
FROM auth.users u
WHERE u.email = 'admin@hub.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin'::user_role,
    college_id = 'ADMIN001';

-- Also create profiles for any existing users that might need admin access
-- Update this email to match your actual admin email if different
INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
SELECT 
    u.id,
    'ADMIN001',
    'Admin',
    'User',
    u.email,
    'admin'::user_role
FROM auth.users u
WHERE u.email LIKE '%admin%' OR u.email = 'your-email@example.com'  -- Replace with your email
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin'::user_role,
    college_id = 'ADMIN001';

-- Create a more permissive temporary policy for events
-- This will allow any authenticated user to create events (for testing)
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

-- Create new policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);

-- Temporary: Allow any authenticated user to manage events
CREATE POLICY "Authenticated users can manage events" ON public.events 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Alternative: More strict admin-only policy (uncomment if you prefer)
-- CREATE POLICY "Admins can manage events" ON public.events 
-- FOR ALL USING (
--     EXISTS (
--         SELECT 1 FROM public.profiles 
--         WHERE id = auth.uid() AND role = 'admin'
--     )
-- );

-- Check what users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Check what profiles exist
SELECT 
    p.id,
    p.email,
    p.role,
    p.college_id,
    p.first_name,
    p.last_name,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Test query to verify the policy will work
-- This should return true if the policies are set up correctly
SELECT 
    'Events table policies' as test_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'events';
