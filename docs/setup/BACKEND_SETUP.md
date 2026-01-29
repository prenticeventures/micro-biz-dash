# Backend Setup Guide

This guide covers setting up the Supabase backend for Micro-Biz Dash.

## Quick Start

1. **Create Supabase Project** (if not already done)
2. **Configure Environment Variables** (`.env.local`)
3. **Set Up Database Schema** (run SQL)
4. **Install Dependencies** (`npm install`)

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in (or create an account)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `micro-biz-dash` (or any name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine for development
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be created

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API Keys**
2. Copy these two values:

   **Project URL**
   - Found in your browser's address bar or on the API Keys page
   - Format: `https://[project-id].supabase.co`
   - Example: `https://zbtbtmybzuutxfntdyvp.supabase.co`

   **Publishable Key (anon public key)**
   - Under **"Publishable key"**, copy the **"default"** key
   - May start with `sb_publishable_...` or be a long JWT

## Step 3: Configure Environment Variables

1. Create or edit `.env.local` in the project root
2. Add your credentials:

```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-publishable-key]
```

3. Save the file

**Note:** `.env.local` is gitignored and won't be committed to the repository.

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `database/schema.sql` from this project
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" ✅

### Verify Database Setup

1. Go to **Table Editor** (left sidebar)
2. You should see 3 new tables:
   - ✅ `users` - User profiles and game names
   - ✅ `game_sessions` - Save states for resume functionality
   - ✅ `user_stats` - Statistics for leaderboards

## Step 5: Install Dependencies

Run this command in your terminal:

```bash
npm install @supabase/supabase-js
```

## Step 6: Verify Setup

1. Restart your dev server if it's running:
   ```bash
   npm run dev
   ```

2. Check the browser console - you should NOT see any Supabase connection errors

## Development vs Production

The project supports separate Supabase projects for development and production:

- **Development:** For testing and development (email confirmation can be disabled)
- **Production:** For live app (email confirmation enabled for security)

To switch between environments, update `.env.local` with the appropriate project credentials.

See `docs/setup/ENVIRONMENTS.md` for detailed information about managing multiple environments.

## What Was Created?

### Database Tables:
- **users** - Stores user profiles and game names
- **game_sessions** - Saves game state for resume functionality
- **user_stats** - Tracks statistics for leaderboards

### Code Files:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/services/authService.ts` - User authentication
- `src/services/gameStateService.ts` - Save/load game sessions
- `src/services/statsService.ts` - Statistics and leaderboard
- `src/types/database.ts` - TypeScript types for database

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env.local` exists and has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding the file

**Error: "Failed to create user"**
- Check that you ran the SQL schema file in Step 4
- Make sure the tables were created (check in Supabase → Table Editor)

**Can't connect to Supabase**
- Verify your Project URL and API key are correct
- Check that your Supabase project is active (not paused)

## Next Steps

Once setup is complete, you can:
1. ✅ User registration and login
2. ✅ Save game progress
3. ✅ Resume games
4. ✅ Track statistics
5. ✅ View leaderboard
