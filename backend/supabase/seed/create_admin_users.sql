-- ============================================================================
-- Admin User Creation Script for IRA IFRS 17 Exam Admin Portal
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- Option 1: Use Supabase Dashboard (Recommended)
-- 1. Go to your Supabase project dashboard: https://supabase.com/dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user" > "Create new user"
-- 4. Enter the email and password below
-- 5. After user is created, run the SQL below in SQL Editor to set admin role
--
-- Option 2: Use this SQL in Supabase SQL Editor
-- (Only works if you have direct database access)
-- ============================================================================

-- ============================================================================
-- ADMIN CREDENTIALS
-- ============================================================================
-- 
-- Admin User 1:
--   Email: admin@iraexam.co.ke
--   Password: Admin@IFRS17!2025
--   Role: super_admin
--
-- Admin User 2:
--   Email: examadmin@iraexam.co.ke  
--   Password: ExamAdmin@2025!
--   Role: admin
--
-- ============================================================================

-- ============================================================================
-- STEP 1: Create users via Supabase Auth API or Dashboard
-- ============================================================================
-- You MUST first create users through one of these methods:
-- 
-- A) Supabase Dashboard: Authentication > Users > Add user
-- B) Supabase Auth API call
-- C) Sign up through your application
--
-- After creating the auth users, proceed to Step 2.

-- ============================================================================
-- STEP 2: Update user profiles to admin roles
-- ============================================================================
-- Run these AFTER creating the users in Supabase Auth:

-- Update admin@iraexam.co.ke to super_admin
UPDATE public.profiles 
SET role = 'super_admin', 
    full_name = 'System Administrator',
    updated_at = NOW()
WHERE email = 'admin@iraexam.co.ke';

-- Update examadmin@iraexam.co.ke to admin
UPDATE public.profiles 
SET role = 'admin',
    full_name = 'Exam Administrator', 
    updated_at = NOW()
WHERE email = 'examadmin@iraexam.co.ke';

-- ============================================================================
-- ALTERNATIVE: If profiles don't exist yet, insert them manually
-- ============================================================================
-- This requires knowing the auth.users UUID. Get it from the Auth dashboard.

-- INSERT INTO public.profiles (id, full_name, email, role, organisation)
-- VALUES 
--   ('USER_UUID_FROM_AUTH', 'System Administrator', 'admin@iraexam.co.ke', 'super_admin', 'Insurance Regulatory Authority'),
--   ('USER_UUID_FROM_AUTH', 'Exam Administrator', 'examadmin@iraexam.co.ke', 'admin', 'Insurance Regulatory Authority');

-- ============================================================================
-- VERIFICATION: Check admin users exist
-- ============================================================================
SELECT id, full_name, email, role, created_at 
FROM public.profiles 
WHERE role IN ('admin', 'super_admin')
ORDER BY role DESC, created_at;
