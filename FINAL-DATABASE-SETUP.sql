-- FINAL DATABASE SETUP FOR CAMPUS CONNECT
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- This will create all required tables and fix all issues

-- Step 1: Drop existing tables to start fresh (if they exist)
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    college_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create clubs table
CREATE TABLE public.clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category TEXT NOT NULL,
    faculty VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create events table
CREATE TABLE public.events (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create event_registrations table with proper foreign keys
CREATE TABLE public.event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- Step 6: Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 8: Create comprehensive RLS policies
-- Profiles policies
CREATE POLICY "Anyone can create profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Clubs policies
CREATE POLICY "Anyone can view clubs" ON public.clubs
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage clubs" ON public.clubs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Admins can create events" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

CREATE POLICY "Admins can update events" ON public.events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Event registrations policies
CREATE POLICY "Students can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all registrations" ON public.event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 9: Insert sample clubs
INSERT INTO public.clubs (id, name, category, faculty, description) VALUES
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Robotics Club', 'STEM', 'Dr. Lee', 'Build and program robots for competitions and learning.'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Drama Society', 'Arts', 'Ms. Patel', 'Theater performances and dramatic arts.'),
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Eco Warriors', 'Community', 'Mr. Gomez', 'Environmental sustainability and green initiatives.'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'Music Club', 'Arts', 'Ms. Rodriguez', 'Musical performances and appreciation.'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'Sports Club', 'Sports', 'Mr. Johnson', 'Athletic activities and competitive sports.');

-- Step 10: Insert sample events
INSERT INTO public.events (id, title, club_id, venue, start_time, end_time, category, capacity, description) VALUES
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'Robotics Workshop', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Engineering Lab A', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'Workshop', 30, 'Learn basic robotics and programming.'),
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'Drama Auditions', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Main Auditorium', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 'Audition', 50, 'Auditions for the upcoming play.'),
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'Environmental Awareness Seminar', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Conference Hall', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour', 'Seminar', 100, 'Learn about environmental conservation.');

-- Step 11: Verify setup
SELECT 'Database setup completed successfully!' as status,
       (SELECT COUNT(*) FROM public.clubs) as clubs_count,
       (SELECT COUNT(*) FROM public.events) as events_count;

-- Step 12: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'All tables created, policies set, and sample data inserted!' as final_status;
