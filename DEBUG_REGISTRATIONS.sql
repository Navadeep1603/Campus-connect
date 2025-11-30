-- ============================================
-- DEBUG SCRIPT - Check Registration Data
-- ============================================

-- 1. Check the structure of event_registrations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_registrations';

-- 2. Get sample registration with raw data
SELECT * FROM event_registrations LIMIT 1;

-- 3. Check if student_id exists in profiles
SELECT 
  er.id as registration_id,
  er.student_id,
  er.status,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.college_id
FROM event_registrations er
LEFT JOIN profiles p ON p.id::text = er.student_id::text
WHERE er.status = 'pending'
LIMIT 5;

-- 4. Check data types of IDs
SELECT 
  'profiles' as table_name,
  id,
  pg_typeof(id) as id_type
FROM profiles 
LIMIT 1;

SELECT 
  'event_registrations' as table_name,
  student_id,
  pg_typeof(student_id) as id_type
FROM event_registrations 
LIMIT 1;
