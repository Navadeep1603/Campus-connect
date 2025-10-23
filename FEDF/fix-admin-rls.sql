-- Fix Admin RLS Issue - Run this in Supabase SQL Editor

-- First, let's check if you have a profile
-- Replace 'your-admin-email@example.com' with your actual admin email
-- SELECT * FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Option 1: Create profile for existing admin user (if you have one)
-- Replace the email and details with your actual admin account
INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
SELECT 
    id,
    'ADMIN001',
    'Admin',
    'User',
    email,
    'admin'::user_role
FROM auth.users 
WHERE email = 'admin@hub.com'  -- Replace with your admin email
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin'::user_role,
    college_id = 'ADMIN001';

-- Option 2: Temporarily disable RLS for events table (quick fix)
-- Uncomment the line below if you want to disable RLS temporarily
-- ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Option 3: Create a more permissive policy for testing
-- This allows any authenticated user to create events (temporary)
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
CREATE POLICY "Authenticated users can manage events" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);

-- Option 4: Check your current user ID and role
-- Run this to see your current authentication status
SELECT 
    auth.uid() as current_user_id,
    p.role as current_role,
    p.email,
    p.college_id
FROM public.profiles p 
WHERE p.id = auth.uid();

-- If the above returns no results, you need to create a profile
-- Use this template (replace with your actual details):
/*
INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
VALUES (
    auth.uid(),
    'YOUR_COLLEGE_ID',
    'Your First Name',
    'Your Last Name',
    'your-email@example.com',
    'admin'::user_role
);
*/
