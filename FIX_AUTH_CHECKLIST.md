# Authentication Fix Checklist

Follow these steps in order to fix the authentication issue.

## Step 1: Run Diagnostic Check

1. Open Supabase SQL Editor: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/sql/new

2. Copy the entire contents of `database/diagnostic-check.sql`

3. Paste into SQL Editor and click **"Run"**

4. Review the output and determine which scenario you're in:

### Scenario A: No tables exist
```
CHECK 1: Required Tables
(shows 0 rows or missing tables)
```
**Solution:** Run `database/schema.sql` (go to Step 2A)

### Scenario B: Tables exist but no trigger
```
CHECK 1: Required Tables ✅ (shows 3 tables)
CHECK 2: Auth Trigger (shows 0 rows) ❌
```
**Solution:** Run `database/add-auth-trigger.sql` (go to Step 2B)

### Scenario C: Everything exists
```
CHECK 1: Required Tables ✅
CHECK 2: Auth Trigger ✅
CHECK 7: Counts don't match
```
**Solution:** Trigger is working now, but existing users need profiles (go to Step 3)

---

## Step 2A: Create Database Schema (if tables don't exist)

1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/sql/new

2. Copy the entire contents of `database/schema.sql`

3. Paste and click **"Run"**
   - ⚠️ **You'll see a warning about "destructive operation"** - this is expected!
   - ✅ **It's safe to proceed** - the file uses `IF NOT EXISTS` patterns, so it won't break existing tables
   - Click "Run this query" to continue

4. You should see: "Success. No rows returned"

5. **Skip to Step 3** (schema.sql already includes the trigger!)

---

## Step 2B: Add Missing Trigger (if tables exist but trigger doesn't)

1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/sql/new

2. Copy the entire contents of `database/add-auth-trigger.sql`

3. Paste and click **"Run"**
   - ⚠️ **You'll see a warning about "destructive operation"** - this is expected!
   - ✅ **It's safe to proceed** - the file uses `CREATE OR REPLACE` and `DROP IF EXISTS`, so it won't break existing data
   - Click "Run this query" to continue

4. You should see: "Success. No rows returned"

5. Continue to Step 3

---

## Step 3: Fix Email Confirmation Settings (Recommended for Dev)

1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/auth/settings

2. Scroll to **"User Signups"** section

3. Look for **"Enable email confirmations"**

4. Toggle it **OFF** for development (makes testing faster)

5. Click **"Save"** at the bottom

**Why?** This allows you to test signup/login immediately without checking email every time.

---

## Step 4: Clean Up Test Users (Optional)

If you've been testing and have broken user accounts:

1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/auth/users

2. Delete any test users that don't have profiles

3. This gives you a clean slate for testing

---

## Step 5: Test Authentication

### Test Signup:

1. Open your app in **incognito/private window** (fresh state)

2. Try to sign up with a **new email address**

3. Expected result:
   - Success message appears
   - No error about "trigger"
   - Can immediately log in (if email confirmation disabled)

### Test Login:

1. Use the email/password you just created

2. Expected result:
   - Successfully logs in
   - No "Invalid credentials" error
   - App loads your game profile

### Check Database:

1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/editor

2. Open the `users` table

3. You should see your new user with:
   - Matching ID from auth.users
   - Generated game_name (Player_XXXXX)
   - Your email address

---

## Troubleshooting

### Still getting "User profile was not created by trigger" error?

**Check trigger is actually there:**
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
Should return 1 row.

**Check function exists:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```
Should return 1 row.

### Getting "Invalid credentials" when logging in?

**If email confirmation is enabled:**
- Check your email for confirmation link
- Click the link
- Then try logging in again

**If email confirmation is disabled:**
- Check you're using the correct password
- Check you're on the right environment (dev vs prod)
- Check `.env.local` has the correct `VITE_SUPABASE_URL`

### No users appearing in database?

**Check RLS policies:**
```sql
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'users';
```
Should show policies like "Users can insert own profile"

---

## Verification Commands

Run these in Supabase SQL Editor to verify everything:

```sql
-- Should show 3 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_stats', 'game_sessions');

-- Should show 1 trigger (ENABLED)
SELECT tgname, tgenabled FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Counts should match (after trigger is working)
SELECT
  (SELECT COUNT(*) FROM auth.users) as auth_count,
  (SELECT COUNT(*) FROM public.users) as public_count;
```

---

## Success Criteria

You'll know it's working when:

- ✅ Can sign up with new email without errors
- ✅ Can log in immediately (if email confirmation off)
- ✅ New user appears in both `auth.users` and `public.users`
- ✅ New entry appears in `public.user_stats`
- ✅ No console errors about triggers or profiles
- ✅ Game loads with your profile

---

## Next Steps After Fix

Once authentication is working:

1. Update [docs/CURRENT_DEBUG_SESSION.md](docs/CURRENT_DEBUG_SESSION.md) with resolution
2. Test on production (if needed)
3. Consider adding more detailed error messages in UI
4. Document this issue for future reference

---

## Files Reference

- `database/diagnostic-check.sql` - Diagnostic queries
- `database/schema.sql` - Full schema with trigger
- `database/add-auth-trigger.sql` - Standalone trigger
- `docs/TROUBLESHOOTING_AUTH.md` - Detailed auth troubleshooting
- `.env.local` - Environment configuration
