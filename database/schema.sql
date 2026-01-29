-- Micro-Biz Dash Database Schema
-- 
-- This SQL file creates all the tables needed for the game backend.
-- Run this in your Supabase SQL Editor to set up the database.
--
-- Instructions:
-- 1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run" to create all tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_played_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.users FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

-- Policy: Users can update their own profile (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- Policy: Users can insert their own profile (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.users FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================================================
-- GAME_SESSIONS TABLE
-- ============================================================================
-- Stores game save states (allows resume functionality)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  health INTEGER NOT NULL DEFAULT 3,
  player_position_x REAL NOT NULL DEFAULT 50,
  player_position_y REAL NOT NULL DEFAULT 100,
  game_state TEXT NOT NULL DEFAULT '{}', -- JSON string of full game state
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own sessions (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_sessions' 
    AND policyname = 'Users can manage own sessions'
  ) THEN
    CREATE POLICY "Users can manage own sessions"
      ON public.game_sessions FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_active 
  ON public.game_sessions(user_id, is_active);

-- ============================================================================
-- USER_STATS TABLE
-- ============================================================================
-- Stores aggregated statistics for each user
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL, -- Denormalized for leaderboard queries
  best_score INTEGER NOT NULL DEFAULT 0,
  highest_level INTEGER NOT NULL DEFAULT 0,
  total_playtime_seconds INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_coins_collected INTEGER NOT NULL DEFAULT 0,
  games_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own stats (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Users can read own stats'
  ) THEN
    CREATE POLICY "Users can read own stats"
      ON public.user_stats FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can update their own stats (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Users can update own stats'
  ) THEN
    CREATE POLICY "Users can update own stats"
      ON public.user_stats FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can insert their own stats (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Users can insert own stats'
  ) THEN
    CREATE POLICY "Users can insert own stats"
      ON public.user_stats FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Anyone can read stats for leaderboard (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Public can read leaderboard stats'
  ) THEN
    CREATE POLICY "Public can read leaderboard stats"
      ON public.user_stats FOR SELECT
      USING (true);
  END IF;
END $$;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_best_score 
  ON public.user_stats(best_score DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically create user profile when auth.users gets a new entry.
-- CRITICAL: This trigger is required for signup to work!
-- Writes to BOTH public.users AND public.user_stats; never swallow errors or we
-- can commit partial state (user in one table but not the other).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Create profile
  INSERT INTO public.users (id, game_name, email)
  VALUES (
    NEW.id,
    'Player_' || substring(NEW.id::text from 1 for 8),
    NEW.email
  );

  -- 2. Create stats row (same transaction; if either fails, whole signup rolls back)
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

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table (only create if it doesn't exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for game_sessions table (only create if it doesn't exist)
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON public.game_sessions;
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_stats table (only create if it doesn't exist)
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.users IS 'User profiles with game names';
COMMENT ON TABLE public.game_sessions IS 'Save states for game sessions';
COMMENT ON TABLE public.user_stats IS 'Aggregated statistics for leaderboards';

COMMENT ON COLUMN public.game_sessions.game_state IS 'JSON string containing full game state (entities, camera position, etc.)';
COMMENT ON COLUMN public.user_stats.game_name IS 'Denormalized from users table for faster leaderboard queries';
