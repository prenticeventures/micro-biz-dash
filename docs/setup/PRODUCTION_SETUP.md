# Production Environment Setup

**Last Updated:** February 2, 2026

## Overview

This guide covers setting up and testing Micro-Biz Dash with the production Supabase project.

---

## Production Database Status ✅

**Verified:** Production Supabase project is fully configured:

- ✅ **Tables:** All 3 tables exist (users, user_stats, game_sessions)
- ✅ **Trigger:** `on_auth_user_created` is ENABLED
- ✅ **Function:** `handle_new_user()` with error handling
- ✅ **RLS Policies:** All 8 policies configured
- ✅ **Email Confirmation:** Enabled (for production security)

**Production Project:**
| Property | Value |
|----------|-------|
| Project ID | `zbtbtmybzuutxfntdyvp` |
| URL | https://zbtbtmybzuutxfntdyvp.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp |

---

## Environment Configuration

### For Local Testing with Production

To test production locally, update `.env.local`:

```env
# PRODUCTION CONFIGURATION
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS
```

Or use the switch script:
```bash
./scripts/switch-env.sh prod
npm run dev
```

**Note:** Email confirmation is enabled in production. You'll need to check your email for confirmation links.

### For Production Deployment

Set environment variables in your hosting platform:

**Vercel:**
- Project Settings → Environment Variables

**Netlify:**
- Site Settings → Environment Variables

**Variables to set:**
```
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS
```

---

## Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Project | `micro-biz-dash-dev` | `micro-biz-dash` |
| Email confirmation | Disabled | Enabled |
| Data | Test data | Real users |
| URL | vgkpbslbfvcwvlmwkowj.supabase.co | zbtbtmybzuutxfntdyvp.supabase.co |

---

## Testing Production Locally

1. **Switch to production config:**
   ```bash
   ./scripts/switch-env.sh prod
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test authentication:**
   - Sign up with a real email
   - Check email for confirmation link
   - Click link to confirm
   - Log in

4. **Test game features:**
   - Play as guest (Level 1)
   - Sign up to save progress
   - Test game state saving
   - Check leaderboard

5. **Switch back to development:**
   ```bash
   ./scripts/switch-env.sh dev
   ```

---

## Security Notes

### Email Confirmation
- **Production has email confirmation ENABLED** - this is correct for security
- Users must click email link before they can log in
- Prevents spam accounts

### Row Level Security (RLS)
- Users can only access their own data
- Leaderboard is public read-only (scores only)
- All policies are enabled and tested

### Guest Mode
- Users can play Level 1 without signing up
- Progress not saved for guests
- Must sign up to access full game

---

## Troubleshooting

### Can't Log In After Signup
- Check email for confirmation link (including spam)
- Production requires email confirmation
- Click the link, then try logging in

### "User profile was not created by trigger"
- This issue was fixed (Jan 29, 2026)
- If it occurs, check trigger is enabled in dashboard
- See [TROUBLESHOOTING_AUTH.md](../TROUBLESHOOTING_AUTH.md)

### Wrong Environment
- Verify `.env.local` has correct URLs
- Restart dev server after changes
- Check browser console for Supabase URL

---

## Related Documentation

- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md) - Full deployment steps
- [Environments Guide](ENVIRONMENTS.md) - Dev vs Prod explained
- [Backend Setup](BACKEND_SETUP.md) - Initial Supabase setup
