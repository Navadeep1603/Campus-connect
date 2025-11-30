-- ============================================
-- CAMPUS CONNECT - SUPABASE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CREATE event_registrations TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  UNIQUE(event_id, student_id)
);

-- 2. CREATE notifications TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. DROP existing policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Students can create registrations" ON event_registrations;
DROP POLICY IF EXISTS "Students can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- 5. CREATE RLS POLICIES FOR event_registrations
-- ============================================

-- Students can create their own registrations
CREATE POLICY "Students can create registrations"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Students can view their own registrations
CREATE POLICY "Students can view own registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Admins can view ALL registrations
CREATE POLICY "Admins can view all registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update registrations (approve/reject)
CREATE POLICY "Admins can update registrations"
ON event_registrations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can delete registrations
CREATE POLICY "Admins can delete registrations"
ON event_registrations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 6. CREATE RLS POLICIES FOR notifications
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Anyone authenticated can create notifications (for system notifications)
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 8. VERIFY SETUP
-- ============================================
SELECT 'event_registrations table created' as status;
SELECT 'notifications table created' as status;
SELECT 'RLS policies created' as status;
SELECT 'Indexes created' as status;
SELECT '✅ SETUP COMPLETE!' as status;
