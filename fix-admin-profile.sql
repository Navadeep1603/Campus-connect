-- Fix Admin Profile and RLS Policies
-- Run this in your Supabase SQL Editor

-- First, let's see your current user ID
SELECT auth.uid() as your_user_id, auth.email() as your_email;

-- Create admin profile for the current authenticated user
-- Replace the details below with your actual information
INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
VALUES (
    auth.uid(),
    'ADMIN001',
    'Admin',
    'User',
    auth.email(),
    'admin'::user_role
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin'::user_role,
    college_id = 'ADMIN001';

-- Also create a profile for the default admin account
INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
SELECT 
    id,
    'ADMIN001',
    'Admin',
    'User',
    email,
    'admin'::user_role
FROM auth.users 
WHERE email = 'admin@hub.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin'::user_role,
    college_id = 'ADMIN001';

-- Update RLS policies to be more permissive for events
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;

-- Create more permissive policies for events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON public.events FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can update events" ON public.events FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete events" ON public.events FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Verify your profile was created
SELECT 
    p.id,
    p.email,
    p.role,
    p.college_id,
    p.first_name,
    p.last_name
FROM public.profiles p 
WHERE p.id = auth.uid();

-- Test if you can now create events (should return true for admins)
SELECT 
    auth.uid() as current_user,
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) as can_create_events;
