# Production Deployment Checklist

**Last Updated:** February 2, 2026

Use this checklist when deploying to production.

---

## Pre-Deployment Verification

### Database ✅
- [x] Production database schema applied
- [x] All tables exist (users, user_stats, game_sessions)
- [x] Trigger `on_auth_user_created` is ENABLED
- [x] Function `handle_new_user()` exists with error handling
- [x] All RLS policies configured (8 policies)
- [x] Email confirmation enabled in production

### Code ✅
- [x] Authentication flow working (fixed Jan 29)
- [x] Guest mode implemented (added Jan 30)
- [x] Mobile controls working (fixed Jan 30)
- [x] Audio system working (fixed Jan 29)
- [x] Retry timeout optimized for production
- [x] No console errors in browser

### Features to Test Before Deploy
- [ ] Sign up with new email
- [ ] Confirm email and log in
- [ ] Play game as guest (Level 1)
- [ ] Play game as authenticated user
- [ ] Game state saves correctly
- [ ] Leaderboard displays scores

---

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
- No build errors

### Step 2: Set Production Environment Variables

**In your hosting platform (Vercel, Netlify, etc.):**

```
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS
```

**Important:** 
- Variables MUST be prefixed with `VITE_` for Vite to include them
- Set these BEFORE building/deploying
- Restart deployment after setting variables

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
- Configure SPA routing (serve `index.html` for all routes)

### Step 4: Verify Deployment

- [ ] Site loads without errors
- [ ] Guest mode works (can play Level 1)
- [ ] Sign up works
- [ ] Email confirmation received
- [ ] Login works after confirmation
- [ ] Game starts and plays correctly
- [ ] Game state saves
- [ ] Leaderboard displays
- [ ] No console errors

---

## Post-Deployment

### Monitor
- [ ] Check Supabase dashboard for new user signups
- [ ] Monitor for errors in browser console
- [ ] Check database for game sessions being created
- [ ] Verify leaderboard updates

### Test Production Features
- [ ] Sign up with new email
- [ ] Confirm email and log in
- [ ] Play as guest first, then sign up
- [ ] Play through a level
- [ ] Die and verify lives system works
- [ ] Complete a level and check stats
- [ ] Check leaderboard shows your score

---

## Rollback Plan

If something goes wrong:

1. **Revert environment variables** to development (if needed)
2. **Redeploy previous working version**
3. **Check Supabase logs** for errors
4. **Review browser console** for client-side errors

---

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

---

## Important Notes

### Email Confirmation
- **Production has email confirmation ENABLED** ✅
- Users must check email and click confirmation link
- This is correct for production security

### Guest Mode
- Users can play Level 1 without signing up
- Signing up required to save progress and access all levels
- Guest progress is not saved

### Data Isolation
- Development and production use separate Supabase projects
- No data mixing between environments
- Safe to test in dev without affecting production

### Security
- RLS policies ensure users can only access their own data
- Leaderboard is public read-only (scores only)
- All authentication handled by Supabase Auth

---

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
- See [TROUBLESHOOTING_AUTH.md](TROUBLESHOOTING_AUTH.md)

### Game Features Not Working
- Check browser console for errors
- Verify database schema is applied
- Test in development first to isolate issues
