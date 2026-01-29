# Final Setup Step - Database Tables

Your `.env.local` is configured ✅  
Now just create the database tables (one copy/paste):

## Quick Steps

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/zbtbtmybzuutxfntdyvp/sql/new
   - Or: Dashboard → **SQL Editor** (left sidebar) → **New query**

2. **Copy the SQL:**
   - Open `database/schema.sql` from this project
   - Select **ALL** (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **Paste & Run:**
   - Paste into the SQL Editor
   - Click **"Run"** (or Cmd/Ctrl + Enter)
   - You should see: **"Success. No rows returned"** ✅

4. **Verify:**
   - Go to **Table Editor** (left sidebar)
   - You should see 3 tables: `users`, `game_sessions`, `user_stats`

## That's It!

Once the tables are created:
- ✅ Backend is fully set up
- ✅ Ready for Phase 2: Building UI components
- ✅ Ready to test: `npm install @supabase/supabase-js` then `npm run dev`

---

**This takes 30 seconds - just copy/paste the SQL!** 🚀
