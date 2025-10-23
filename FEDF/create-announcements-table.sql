-- Create announcements table for Campus Connect
-- Run this SQL command in your Supabase SQL editor

-- Create announcement type enum
CREATE TYPE announcement_type AS ENUM ('info', 'warning', 'urgent', 'success', 'event');
CREATE TYPE announcement_audience AS ENUM ('all', 'students', 'faculty', 'event');

-- Announcements table
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    type announcement_type NOT NULL DEFAULT 'info',
    target_audience announcement_audience NOT NULL DEFAULT 'all',
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
-- Anyone can view announcements targeted to them
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);

-- Only admins can create announcements
CREATE POLICY "Only admins can create announcements" ON public.announcements FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Only admins can update/delete announcements
CREATE POLICY "Only admins can manage announcements" ON public.announcements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Add insert policy for notifications
CREATE POLICY "Admins can create any notifications" ON public.notifications FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Create trigger for updated_at
CREATE TRIGGER update_announcements_updated_at 
BEFORE UPDATE ON public.announcements 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_audience ON public.announcements(target_audience);
