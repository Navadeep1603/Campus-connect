-- ============================================
-- DIAGNOSTIC SCRIPT TO CHECK PROFILE DATA
-- Run this in Supabase SQL Editor to see what data exists
-- ============================================

-- 1. Check all student profiles
SELECT 
  id,
  email,
  first_name,
  last_name,
  college_id,
  role,
  created_at
FROM profiles
WHERE role = 'student'
ORDER BY created_at DESC;

-- 2. Check event registrations with student IDs
SELECT 
  er.id as registration_id,
  er.student_id,
  er.event_id,
  er.status
FROM event_registrations er
ORDER BY er.id DESC
LIMIT 10;

-- 3. Try to join registrations with profiles (this is what should work)
SELECT 
  er.id as registration_id,
  er.student_id,
  er.status,
  p.email,
  p.first_name,
  p.last_name,
  p.college_id,
  e.title as event_title
FROM event_registrations er
LEFT JOIN profiles p ON p.id = er.student_id
LEFT JOIN events e ON e.id = er.event_id
WHERE er.status = 'pending'
ORDER BY er.id DESC;

-- 4. Check for orphaned registrations (students with no profile)
SELECT 
  er.id as registration_id,
  er.student_id,
  er.status,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE FOUND'
    ELSE '✅ Profile exists'
  END as profile_status
FROM event_registrations er
LEFT JOIN profiles p ON p.id = er.student_id
WHERE er.status = 'pending';

-- 5. Check auth users vs profiles
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.first_name,
  p.last_name,
  p.college_id,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING PROFILE'
    WHEN p.first_name IS NULL THEN '⚠️ MISSING FIRST NAME'
    WHEN p.last_name IS NULL THEN '⚠️ MISSING LAST NAME'
    WHEN p.college_id IS NULL THEN '⚠️ MISSING COLLEGE ID'
    ELSE '✅ COMPLETE'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.id DESC;

-- 6. Summary statistics
SELECT 
  'Total Students' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'student'
UNION ALL
SELECT 
  'Students with First Name' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'student' AND first_name IS NOT NULL
UNION ALL
SELECT 
  'Students with Last Name' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'student' AND last_name IS NOT NULL
UNION ALL
SELECT 
  'Students with College ID' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'student' AND college_id IS NOT NULL;
