-- ============================================================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- ============================================================================
-- This trigger automatically creates user profile entries when a new user
-- signs up through Supabase Auth.
--
-- IMPORTANT: This trigger was MISSING from the original schema.sql file,
-- causing the "User profile was not created by trigger" error.
--
-- How to apply:
-- 1. Go to https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/sql/new
-- 2. Copy and paste this file
-- 3. Click "Run"
-- ============================================================================

-- Function that creates user profile and stats when auth.users gets a new entry.
-- Writes to BOTH public.users AND public.user_stats; do not add an EXCEPTION
-- handler that swallows errors or we can commit partial state (user in one table only).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, game_name, email)
  VALUES (
    NEW.id,
    'Player_' || substring(NEW.id::text from 1 for 8),
    NEW.email
  );

  INSERT INTO public.user_stats (user_id, game_name)
  VALUES (
    NEW.id,
    'Player_' || substring(NEW.id::text from 1 for 8)
  );

  RETURN NEW;
END;
$$;

-- Trigger that fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile and stats when a new user signs up';
