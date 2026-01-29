# Authentication Troubleshooting Guide

## Common Authentication Issues and Solutions

### Issue 1: "User profile was not created by trigger" Error

**Symptoms:**
- Signup fails immediately after submitting
- Error message: "User profile was not created by trigger"
- No confirmation email received (or email received but profile still not created)

**Root Cause:**
The database is missing the trigger that automatically creates user profiles when someone signs up.

**Solution:**
Apply the missing trigger to your database:

1. Go to your Supabase SQL Editor:
   - **Dev:** https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/sql/new
   - **Prod:** https://app.supabase.com/project/zbtbtmybzuutxfntdyvp/sql/new

2. Copy the contents of `database/add-auth-trigger.sql`

3. Paste and click "Run"

4. Verify trigger was created:
   ```sql
   SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

**Why this happens:**
- The code in `src/services/authService.ts:42-65` expects a trigger to create user profiles
- The trigger creates entries in `public.users` and `public.user_stats` tables
- Without the trigger, these entries never get created
- The code waits 2 seconds with retries, then throws this error

**Prevention:**
- Always run the full `database/schema.sql` on new Supabase projects
- The schema now includes this trigger (as of 2026-01-26)
- For existing projects, run `database/add-auth-trigger.sql`

---

### Issue 2: No Confirmation Emails Received

**Symptoms:**
- User signs up successfully
- No confirmation email arrives in inbox or spam
- Can't complete signup process

**Common Causes & Solutions:**

#### Cause 1: Email Confirmation Disabled
Check if email confirmations are turned on:
1. Go to: https://app.supabase.com/project/YOUR_PROJECT/auth/settings
2. Look for "Enable email confirmations"
3. If OFF → Users don't need to confirm (good for dev)
4. If ON → Users must click email link (good for prod)

#### Cause 2: Rate Limiting
Supabase limits signup emails to prevent abuse:
- **Dev environment:** Usually 1 email per minute per address
- **Prod environment:** Check your project settings

**Solution:** Wait the rate limit period and try again with a fresh email address, or disable rate limiting in dev.

#### Cause 3: Email Provider Settings
1. Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/auth
2. Check SMTP settings (if using custom email provider)
3. Verify sender email is configured
4. Check email template settings

---

### Issue 3: "Invalid login credentials" After Signup

**Symptoms:**
- Signup appears successful
- Trying to login immediately fails with "Invalid login credentials"

**Common Causes:**

#### Cause 1: Email Not Confirmed Yet
If email confirmation is enabled, users MUST click the confirmation link before they can log in.

**Solution:**
- Check email for confirmation link (including spam folder)
- Click the link to confirm
- Then try logging in

For dev environment, consider disabling email confirmation:
1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/auth/settings
2. Toggle OFF "Enable email confirmations"
3. Saves time during testing

#### Cause 2: Wrong Environment
Check that you're using the correct Supabase project:

```env
# In .env.local - make sure correct project is uncommented
VITE_SUPABASE_URL=https://vgkpbslbfvcwvlmwkowj.supabase.co  # Dev
# VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co  # Prod
```

---

### Issue 4: Database Schema Missing

**Symptoms:**
- Errors about missing tables (users, user_stats, game_sessions)
- SQL queries failing in console
- Auth errors during signup

**Solution:**
Apply the full database schema:

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql/new
2. Copy entire contents of `database/schema.sql`
3. Paste and click "Run"
4. Verify tables were created in Table Editor

**Important:** The schema.sql file includes:
- All required tables
- Row Level Security (RLS) policies
- Indexes for performance
- **The critical auth trigger** (added 2026-01-26)

---

## Debugging Checklist

When authentication isn't working, check these in order:

- [ ] **Environment variables correct** (`.env.local`)
  - Correct VITE_SUPABASE_URL?
  - Correct VITE_SUPABASE_ANON_KEY?

- [ ] **Database schema applied**
  - Tables exist? (users, user_stats, game_sessions)
  - Run query: `SELECT * FROM public.users LIMIT 1;`

- [ ] **Auth trigger exists**
  - Run query: `SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
  - Should return one row

- [ ] **Email confirmation settings known**
  - Check: Auth settings in Supabase Dashboard
  - Know if enabled or disabled for your testing

- [ ] **Rate limits understood**
  - Check: Auth settings → Rate Limits
  - Wait appropriate time between attempts

- [ ] **Network requests inspected**
  - Open browser DevTools → Network tab
  - Look for requests to Supabase
  - Check response status codes and error messages

---

## How to Verify Everything is Working

### Test 1: Database Connection
```javascript
// Run in browser console
const { data, error } = await supabase.from('users').select('count');
console.log('Database connected:', !error);
```

### Test 2: Auth Trigger Exists
In Supabase SQL Editor:
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```
Should return: `on_auth_user_created | O` (O means enabled)

### Test 3: Full Signup Flow
1. Open app in incognito window (fresh state)
2. Sign up with new email address
3. Check browser console for errors
4. Check Supabase Dashboard → Authentication → Users
5. Should see new user with confirmed status (or pending if email confirmation on)

---

## Environment-Specific Settings

### Development Environment
**Recommended settings for dev:**
- Email confirmations: **DISABLED**
- Rate limits: **Relaxed** (1 per minute is fine)
- SMTP: Use Supabase default email

This allows rapid testing without checking email every time.

### Production Environment
**Recommended settings for prod:**
- Email confirmations: **ENABLED**
- Rate limits: **Strict** (prevents abuse)
- SMTP: Consider custom email provider for better deliverability

---

## Related Files

- `src/services/authService.ts` - Main authentication logic
- `src/lib/supabase.ts` - Supabase client configuration
- `database/schema.sql` - Complete database schema
- `database/add-auth-trigger.sql` - Standalone trigger file
- `.env.local` - Environment configuration (gitignored)

---

## Need More Help?

Check these resources:
1. [Current Debug Session](./CURRENT_DEBUG_SESSION.md) - Latest findings
2. [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
3. [Project Issues](https://github.com/YOUR_REPO/issues) - Known issues and fixes
