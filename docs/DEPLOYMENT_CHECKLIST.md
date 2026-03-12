# Production Deployment Checklist

**Last Updated:** March 12, 2026

Use this checklist when deploying to production.

## Pre-Deployment Verification

### Product Mode
- [x] Confirm whether this deploy is guest-only default or an online-services re-enable
- [x] Default expected mode is guest-only (`VITE_ENABLE_ONLINE_SERVICES` unset or `0`)
- [ ] If re-enabling online services, confirm the Supabase project is active before exposing auth to players

### Code
- [ ] `npm run qa:release` passes on the release candidate
- [ ] `npm run qa:live` passes after web deploy
- [ ] No console errors in browser
- [ ] Guest level 1 -> level 2 flow tested
- [ ] Lives system tested

## Build & Deploy

### Step 1: Build Production Bundle

```bash
./scripts/switch-env.sh prod
npm run qa:release
```

This creates optimized production files in `dist/` folder.

**Verify build:**
- Check `dist/` folder exists
- Check `dist/index.html` exists
- Check assets are included

### Step 2: Set Production Environment Variables

**In your hosting platform (Vercel, Netlify, etc.):**

Set this for the default guest-only build:
```
VITE_ENABLE_ONLINE_SERVICES=0
```

Only if you intentionally want to bring auth/save/leaderboards back:
```
VITE_ENABLE_ONLINE_SERVICES=1
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

**Important:** 
- Variables MUST be prefixed with `VITE_` for Vite to include them
- Set these BEFORE building/deploying
- Restart deployment after setting variables
- `VITE_` variables are client-visible by design (web + iOS bundle). Do not put privileged secrets there.
- Keep privileged credentials (for example Supabase service role keys) only in server-side env vars without `VITE_`.
- Do not enable online services unless the backend is healthy and intentionally part of the release scope.

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
- [ ] Game starts and plays correctly
- [ ] Level 1 completes and continues to level 2 with no login gate
- [ ] No console errors
- [ ] No auth-restore or online-services warning banners in the default guest-only build

**Optional online-services verification:** only run if `VITE_ENABLE_ONLINE_SERVICES=1`
- [ ] Authentication signup works
- [ ] Email confirmation received
- [ ] Login works after confirmation
- [ ] Game state saves
- [ ] Leaderboard displays

## Post-Deployment

### Monitor
- [ ] Monitor for errors in browser console
- [ ] Watch the scheduled `production-smoke` workflow
- [ ] Confirm the live site still reaches the menu normally after deployment

**If online services are enabled for this release:**
- [ ] Check Supabase dashboard for new user signups
- [ ] Check database for game sessions being created
- [ ] Verify leaderboard updates

### Test Production Features
- [ ] Play through a level
- [ ] Continue into level 2
- [ ] Die and verify lives system works

**If online services are enabled for this release:**
- [ ] Sign up with new email
- [ ] Confirm email and log in
- [ ] Complete a level and check stats
- [ ] Check leaderboard shows your score

## Rollback Plan

If something goes wrong:

1. **Revert environment variables** to development (if needed)
2. **Redeploy previous working version**
3. **If online services were enabled, check Supabase logs** for errors
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
- Only relevant when online services are intentionally enabled

### Data Isolation
- Only relevant when online services are enabled

### Security
- The default guest-only build does not depend on a third-party auth provider at runtime
- If online services are enabled later, re-validate the Supabase auth and RLS assumptions before release

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
- If this is a guest-only release, make sure `VITE_ENABLE_ONLINE_SERVICES` is `0` or unset
- Verify production Supabase project is active
- Check environment variables are correct
- Verify trigger is enabled in production database

### Game Features Not Working
- Check browser console for errors
- Verify database schema is applied
- Test in development first to isolate issues
