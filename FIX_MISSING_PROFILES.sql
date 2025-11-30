-- ============================================
-- FIX MISSING PROFILE DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Check which students are missing profile data
SELECT 
  'BEFORE FIX - Missing Data:' as status,
  id,
  email,
  first_name,
  last_name,
  college_id
FROM profiles
WHERE role = 'student'
  AND (first_name IS NULL OR last_name IS NULL OR college_id IS NULL);

-- STEP 2: Update students with placeholder data
-- They can update this later in their profile
UPDATE profiles
SET 
  first_name = COALESCE(
    first_name, 
    INITCAP(SPLIT_PART(email, '@', 1))
  ),
  last_name = COALESCE(
    last_name,
    'Student'
  ),
  college_id = COALESCE(
    college_id,
    SUBSTRING(id::text, 1, 10)
  )
WHERE role = 'student'
  AND (first_name IS NULL OR last_name IS NULL OR college_id IS NULL);

-- STEP 3: Verify the fix
SELECT 
  'AFTER FIX - All Students:' as status,
  id,
  email,
  first_name,
  last_name,
  college_id,
  CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND college_id IS NOT NULL 
    THEN '✅ COMPLETE'
    ELSE '❌ STILL MISSING DATA'
  END as data_status
FROM profiles
WHERE role = 'student'
ORDER BY id DESC;

-- STEP 4: Test the registration join
SELECT 
  er.id as registration_id,
  e.title as event,
  CONCAT(p.first_name, ' ', p.last_name) as student_name,
  p.college_id as student_id,
  er.status
FROM event_registrations er
LEFT JOIN profiles p ON p.id = er.student_id
LEFT JOIN events e ON e.id = er.event_id
WHERE er.status = 'pending'
ORDER BY er.id DESC;

-- STEP 5: If you want to manually set data for specific student
-- (Replace the values with actual student data)
/*
UPDATE profiles
SET 
  first_name = 'Challa',
  last_name = 'Navadeep',
  college_id = '2400030987'
WHERE email = 'student@example.com';
*/
