# Production Environment Setup

**Last Updated:** January 27, 2026

## Overview

This guide covers setting up and deploying Micro-Biz Dash to production.

## Production Database Status ✅

**Verified:** Production Supabase project is fully configured:

- ✅ **Tables:** All 3 tables exist (users, user_stats, game_sessions)
- ✅ **Trigger:** `on_auth_user_created` is ENABLED
- ✅ **Function:** `handle_new_user()` exists
- ✅ **RLS Policies:** All 8 policies are configured correctly
- ✅ **Email Confirmation:** Enabled (for production security)

**Production Project:**
- **Project ID:** `zbtbtmybzuutxfntdyvp`
- **URL:** `https://zbtbtmybzuutxfntdyvp.supabase.co`
- **Status:** ✅ Ready for production use

## Environment Configuration

### For Local Development Testing (Production)

To test production locally, update `.env.local`:

```env
# PRODUCTION CONFIGURATION
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS
```

**Note:** Email confirmation is enabled in production, so you'll need to check your email for confirmation links when testing.

### For Production Deployment

Production deployments should use environment variables set in your hosting platform:

**Vercel:**
- Go to Project Settings → Environment Variables
- Add:
  - `VITE_SUPABASE_URL` = `https://zbtbtmybzuutxfntdyvp.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS`

**Netlify:**
- Go to Site Settings → Environment Variables
- Add the same variables as above

**Other Platforms:**
- Set environment variables according to your platform's documentation
- Make sure variables are prefixed with `VITE_` so Vite includes them in the build

## Production Checklist

### Pre-Deployment

- [x] Production database schema applied
- [x] Trigger enabled and working
- [x] Trigger function updated with error handling (2026-01-27)
- [x] RLS policies configured
- [x] Email confirmation enabled
- [x] Code retry timeout increased for production (2026-01-27)
- [ ] Test authentication flow in production ⏳ **BLOCKED: Rate limit**
- [ ] Test game state saving/loading
- [ ] Test leaderboard functionality
- [ ] Verify iOS app uses production backend (if applicable)

### Deployment Steps

1. **Build Production Bundle**
   ```bash
   npm run build
   ```
   This creates an optimized production build in `dist/` folder.

2. **Set Environment Variables**
   - Configure production environment variables in your hosting platform
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

3. **Deploy**
   - Upload `dist/` folder to your hosting platform
   - Or use platform-specific deployment commands

4. **Verify Deployment**
   - Test signup/login flow
   - Verify game saves work
   - Check leaderboard displays correctly

## Testing Production

### Test Authentication

1. Switch `.env.local` to production config
2. Restart dev server: `npm run dev`
3. Try signing up with a new email
4. Check email for confirmation link
5. Click confirmation link
6. Try logging in

### Test Game Features

1. Sign up and log in
2. Play through a level
3. Check that game state saves
4. Close and reopen app
5. Verify "Resume Game" button appears
6. Complete a level and check stats update
7. Check leaderboard displays your score

## Important Notes

### Email Confirmation

**Production has email confirmation ENABLED** - this is correct for security.

- Users must click email confirmation link before they can log in
- This prevents spam accounts
- Email rate limit: 1 email per minute per address

### Data Isolation

- **Development:** Uses `micro-biz-dash-dev` project (test data)
- **Production:** Uses `micro-biz-dash` project (real user data)
- These are completely separate - no data mixing

### Security

- Production uses Row Level Security (RLS) - users can only access their own data
- Leaderboard is public read-only (game names and scores only)
- All authentication handled securely by Supabase Auth

## Troubleshooting

### "User profile was not created by trigger"

**If this happens in production:**
1. Check trigger exists: Run diagnostic query in production SQL Editor
2. Verify trigger is enabled
3. Check function exists

### Email Confirmation Issues

- Users must check their email (including spam folder)
- Rate limit: 1 email per minute per address
- If testing, use dev environment where email confirmation is disabled

### Environment Variables Not Working

- Make sure variables are prefixed with `VITE_`
- Restart dev server after changing `.env.local`
- In production, verify variables are set in hosting platform settings

## Next Steps After Production Setup

1. ✅ Monitor production database for issues
2. ✅ Set up error tracking (optional)
3. ✅ Monitor user signups and engagement
4. ✅ Plan for scaling if needed
