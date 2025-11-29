-- Complete Database Fix for Campus Connect
-- This will fix the foreign key constraint error
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing event_registrations table if it exists (to recreate with proper constraints)
DROP TABLE IF EXISTS public.event_registrations CASCADE;

-- Step 2: Ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    college_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category TEXT NOT NULL,
    faculty VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    venue VARCHAR(200) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    capacity INTEGER DEFAULT 50,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create event_registrations table with proper foreign key constraints
CREATE TABLE public.event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT event_registrations_event_id_fkey 
        FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
    CONSTRAINT event_registrations_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(event_id, student_id)
);

-- Step 4: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create basic policies (only if they don't exist)
DO $$
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy') THEN
        CREATE POLICY profiles_insert_policy ON public.profiles FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy') THEN
        CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    -- Clubs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clubs' AND policyname = 'clubs_select_policy') THEN
        CREATE POLICY clubs_select_policy ON public.clubs FOR SELECT USING (true);
    END IF;
    
    -- Events policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'events_select_policy') THEN
        CREATE POLICY events_select_policy ON public.events FOR SELECT USING (true);
    END IF;
    
    -- Event registrations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'registrations_insert_policy') THEN
        CREATE POLICY registrations_insert_policy ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'registrations_select_policy') THEN
        CREATE POLICY registrations_select_policy ON public.event_registrations FOR SELECT USING (auth.uid() = student_id);
    END IF;
END
$$;

-- Step 6: Insert sample clubs
INSERT INTO public.clubs (id, name, category, faculty, description) VALUES
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Robotics Club', 'STEM', 'Dr. Lee', 'Build and program robots.'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Drama Society', 'Arts', 'Ms. Patel', 'Theater and performance.'),
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Eco Warriors', 'Community', 'Mr. Gomez', 'Sustainability initiatives.')
ON CONFLICT (id) DO NOTHING;

-- Step 7: Verify the setup
SELECT 'Setup completed successfully!' as status;
