-- ============================================================================
-- DIAGNOSTIC CHECK FOR AUTHENTICATION ISSUES
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose authentication problems
-- Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/sql/new
--
-- This script checks:
-- 1. If required tables exist
-- 2. If the auth trigger exists
-- 3. If RLS policies are set up
-- 4. Sample data from tables
-- ============================================================================

-- Check 1: Required Tables
SELECT
  '=== CHECK 1: Required Tables ===' as check_name;

SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'user_stats', 'game_sessions')
ORDER BY table_name;

-- If you see 3 rows above (users, user_stats, game_sessions), tables exist ✅
-- If you see fewer rows, you need to run database/schema.sql first ❌

-- Check 2: Auth Trigger
SELECT
  '=== CHECK 2: Auth Trigger ===' as check_name;

SELECT
  t.tgname as trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as status,
  p.proname as function_name,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';

-- If you see 1 row with ENABLED status, trigger exists ✅
-- If you see 0 rows, you need to run database/add-auth-trigger.sql ❌

-- Check 3: Trigger Function Exists
SELECT
  '=== CHECK 3: Trigger Function ===' as check_name;

SELECT
  proname as function_name,
  pronargs as num_args,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'handle_new_user';

-- If you see 1 row, function exists ✅
-- If you see 0 rows, you need to run database/add-auth-trigger.sql ❌

-- Check 4: RLS Status
SELECT
  '=== CHECK 4: Row Level Security ===' as check_name;

SELECT
  schemaname,
  tablename,
  CASE rowsecurity
    WHEN true THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'user_stats', 'game_sessions')
ORDER BY tablename;

-- All three should show ENABLED ✅

-- Check 5: Sample Data
SELECT
  '=== CHECK 5: Users Table (Sample) ===' as check_name;

SELECT
  id,
  game_name,
  email,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- Shows recent users (if any exist)

SELECT
  '=== CHECK 6: User Stats Table (Sample) ===' as check_name;

SELECT
  user_id,
  game_name,
  best_score,
  total_sessions
FROM public.user_stats
ORDER BY created_at DESC
LIMIT 5;

-- Shows recent user stats (if any exist)

-- Check 7: Auth Users Count
SELECT
  '=== CHECK 7: Auth Users Count ===' as check_name;

SELECT
  COUNT(*) as auth_users_count
FROM auth.users;

-- Shows how many users exist in auth.users

SELECT
  COUNT(*) as public_users_count
FROM public.users;

-- Should match auth_users_count if trigger is working ✅
-- If lower, trigger might not be working ❌

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
--
-- SCENARIO 1: No tables exist
-- → Run database/schema.sql first (includes trigger)
--
-- SCENARIO 2: Tables exist but no trigger
-- → Run database/add-auth-trigger.sql
--
-- SCENARIO 3: Everything exists but auth_users_count > public_users_count
-- → Trigger wasn't working before, run add-auth-trigger.sql
-- → May need to manually create profiles for existing auth users
--
-- SCENARIO 4: Everything looks good
-- → Problem might be email confirmation settings
-- → Check Auth settings in dashboard
-- ============================================================================
