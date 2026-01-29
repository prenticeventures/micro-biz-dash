# Quick Database Setup - One Copy/Paste!

Your `.env.local` is already configured! ✅

Now just run the SQL to create the database tables:

## Step 1: Open SQL Editor

1. Go to: https://app.supabase.com/project/zbtbtmybzuutxfntdyvp/sql/new
2. Or: In your Supabase dashboard → **SQL Editor** (left sidebar) → **New query**

## Step 2: Copy & Paste This SQL

Copy the **entire contents** of `database/schema.sql` and paste it into the SQL Editor.

Or, if you want to copy it from here, here's the full SQL:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_played_at TIMESTAMPTZ
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- GAME_SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  health INTEGER NOT NULL DEFAULT 3,
  player_position_x REAL NOT NULL DEFAULT 50,
  player_position_y REAL NOT NULL DEFAULT 100,
  game_state TEXT NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON public.game_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_active 
  ON public.game_sessions(user_id, is_active);

-- ============================================================================
-- USER_STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  highest_level INTEGER NOT NULL DEFAULT 0,
  total_playtime_seconds INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_coins_collected INTEGER NOT NULL DEFAULT 0,
  games_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read leaderboard stats"
  ON public.user_stats FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_stats_best_score 
  ON public.user_stats(best_score DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Run It!

1. Click **"Run"** (or press Cmd/Ctrl + Enter)
2. You should see: **"Success. No rows returned"** ✅

That's it! Your database is set up!

## Step 4: Verify

1. Go to **Table Editor** (left sidebar)
2. You should see 3 new tables:
   - ✅ `users`
   - ✅ `game_sessions`
   - ✅ `user_stats`

## Next Steps

Once the database is set up:
1. ✅ Install dependencies: `npm install @supabase/supabase-js`
2. ✅ Test the connection: `npm run dev`
3. ✅ Ready for Phase 2: User System & Onboarding!

---

**That's it!** Just copy/paste the SQL and run it. Let me know when it's done! 🚀
