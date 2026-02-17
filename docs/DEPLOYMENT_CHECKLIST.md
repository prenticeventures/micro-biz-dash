# Production Deployment Checklist

**Last Updated:** January 27, 2026

Use this checklist when deploying to production.

## Pre-Deployment Verification

### Database ✅
- [x] Production database schema applied
- [x] All tables exist (users, user_stats, game_sessions)
- [x] Trigger `on_auth_user_created` is ENABLED
- [x] Function `handle_new_user()` exists
- [x] All RLS policies configured (8 policies)
- [x] Email confirmation enabled in production

### Code
- [x] Production trigger function updated with error handling (2026-01-27)
- [x] Retry timeout increased for production (2026-01-27)
- [ ] All recent changes tested in development
- [ ] No console errors in browser
- [ ] Authentication flow tested ⏳ **BLOCKED: Rate limit**
- [ ] Game state saving/loading tested
- [ ] Leaderboard tested
- [ ] Lives system tested

## Build & Deploy

### Step 1: Build Production Bundle

```bash
npm run build
```

This creates optimized production files in `dist/` folder.

**Verify build:**
- Check `dist/` folder exists
- Check `dist/index.html` exists
- Check assets are included

### Step 2: Set Production Environment Variables

**In your hosting platform (Vercel, Netlify, etc.):**

Set these environment variables:
```
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS
```

**Important:** 
- Variables MUST be prefixed with `VITE_` for Vite to include them
- Set these BEFORE building/deploying
- Restart deployment after setting variables
- `VITE_` variables are client-visible by design (web + iOS bundle). Do not put privileged secrets there.
- Keep privileged credentials (for example Supabase service role keys) only in server-side env vars without `VITE_`.

### Step 3: Deploy

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Manual:**
- Upload `dist/` folder contents to your hosting platform
- Configure your platform to serve `index.html` for all routes (SPA routing)

### Step 4: Verify Deployment

- [ ] Site loads without errors
- [ ] Authentication signup works ⏳ **Testing blocked by rate limit (2026-01-27)**
- [ ] Email confirmation received
- [ ] Login works after confirmation
- [ ] Game starts and plays correctly
- [ ] Game state saves
- [ ] Leaderboard displays
- [ ] No console errors

**Note:** Production trigger function was updated 2026-01-27. Testing will resume once rate limit resets.

## Post-Deployment

### Monitor
- [ ] Check Supabase dashboard for new user signups
- [ ] Monitor for errors in browser console
- [ ] Check database for game sessions being created
- [ ] Verify leaderboard updates

### Test Production Features
- [ ] Sign up with new email
- [ ] Confirm email and log in
- [ ] Play through a level
- [ ] Die and verify lives system works
- [ ] Complete a level and check stats
- [ ] Check leaderboard shows your score

## Rollback Plan

If something goes wrong:

1. **Revert environment variables** to development (if needed)
2. **Redeploy previous working version**
3. **Check Supabase logs** for errors
4. **Review browser console** for client-side errors

## Environment Switching

To test production locally before deploying:

```bash
# Switch to production config
./scripts/switch-env.sh prod

# Restart dev server
npm run dev

# Test production features
# (Remember: email confirmation is enabled!)

# Switch back to dev
./scripts/switch-env.sh dev
```

## Important Notes

### Email Confirmation
- **Production has email confirmation ENABLED** ✅
- Users must check email and click confirmation link
- This is correct for production security

### Data Isolation
- Development and production use separate Supabase projects
- No data mixing between environments
- Safe to test in dev without affecting production

### Security
- RLS policies ensure users can only access their own data
- Leaderboard is public read-only (scores only)
- All authentication handled by Supabase Auth

## Troubleshooting

### Build Fails
- Check for TypeScript errors: `npm run build`
- Verify all dependencies installed: `npm install`
- Check Node version compatibility

### Environment Variables Not Working
- Verify variables are prefixed with `VITE_`
- Restart deployment after setting variables
- Check hosting platform logs

### Authentication Not Working
- Verify production Supabase project is active
- Check environment variables are correct
- Verify trigger is enabled in production database

### Game Features Not Working
- Check browser console for errors
- Verify database schema is applied
- Test in development first to isolate issues
