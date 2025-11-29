-- Create Admin User for Campus Connect
-- Run this in Supabase SQL Editor AFTER running the main schema

-- Note: You'll need to create the user through Supabase Auth first
-- This script just creates the profile entry

-- First, you need to sign up through your app or Supabase Auth UI
-- Then run this to make that user an admin:

-- Replace 'your-user-id-here' with the actual UUID from auth.users table
-- You can find this in Authentication > Users in your Supabase dashboard

-- Example (replace the UUID with your actual user ID):
-- INSERT INTO public.profiles (id, college_id, first_name, last_name, email, role)
-- VALUES (
--     'your-user-id-from-auth-users',
--     'ADMIN001',
--     'Admin',
--     'User', 
--     'admin@hub.com',
--     'admin'
-- );

-- To find your user ID after signing up:
-- SELECT * FROM auth.users;
