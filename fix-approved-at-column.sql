-- Fix missing approved_at column in event_registrations table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name = 'approved_at';
