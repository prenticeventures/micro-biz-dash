# Supabase Backend Setup Guide

This guide will help you set up your Supabase backend for Micro-Biz Dash.

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in (or create an account if you don't have one)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `micro-biz-dash` (or any name you like)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine for now
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be created

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API Keys** (in the left sidebar under Project Settings).
2. You need two values:

   **Project URL**
   - Supabase sometimes shows this on the same page (scroll or look for "Project URL" or "API URL").
   - If you don't see it: look at your **browser’s address bar**. The URL will look like:
     - `https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp/settings/api-keys`
   - The **project reference** is the long id (e.g. `zbtbtmybzuutxfntdyvp`). Your **Project URL** is:
     - `https://zbtbtmybzuutxfntdyvp.supabase.co`
   - Replace `zbtbtmybzuutxfntdyvp` with your own project ref from the URL.

   **Publishable key (= “anon public” key)**
   - Under **"Publishable key"**, you’ll see a key named **"default"** (it may start with `sb_publishable_...` or be a long JWT).
   - **Yes — this is the “anon public” key.** Copy the full key.

3. Copy both the **Project URL** and the **default publishable key**.

## Step 3: Add Credentials to Your Project

1. In your project folder, create a file called `.env.local` (if it doesn’t exist).
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLi...
```

- Use **your** Project URL (with your project ref).
- Use **your** default publishable key (the one you copied). It can look like `sb_publishable_...` or a long JWT; both work.

3. Save the file.

## Step 4: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `database/schema.sql` from this project
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" - this means the tables were created!

## Step 5: Install Dependencies

Run this command in your terminal (from the project folder):

```bash
npm install @supabase/supabase-js
```

## Step 6: Verify Setup

1. Restart your dev server if it's running:
   ```bash
   npm run dev
   ```

2. Check the browser console - you should NOT see any Supabase connection errors

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

## Next Steps

Once setup is complete, you can:
1. ✅ User registration and login
2. ✅ Save game progress
3. ✅ Resume games
4. ✅ Track statistics
5. ✅ View leaderboard

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

## Need Help?

If you run into issues, check:
1. Supabase dashboard → Logs (for database errors)
2. Browser console (for frontend errors)
3. Make sure all files were created correctly
