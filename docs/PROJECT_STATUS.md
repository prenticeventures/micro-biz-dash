# Project Status

**Last Updated:** February 2, 2026

## Overview

Micro-Biz Dash is a retro-style platformer game where players guide an entrepreneur through the stages of building a business. The game features:

- 5 themed levels (Garage → City → Tech → Finance → Victory)
- Lives system and game state persistence
- User authentication with Supabase
- Public leaderboard
- Guest mode (play Level 1 before signing up)
- iOS app support via Capacitor

---

## Current Status: ✅ Production Ready

### Core Features - Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Game mechanics | ✅ Done | Platformer with 5 levels |
| Lives system | ✅ Done | 3 lives, lose all = game over |
| Authentication | ✅ Done | Fixed Jan 29, 2026 |
| Guest mode | ✅ Done | Play Level 1 free before signup |
| Game state saving | ✅ Done | Resume where you left off |
| Leaderboard | ✅ Done | Public scores display |
| Audio system | ✅ Done | Fixed double-play issue Jan 29 |
| Mobile support | ✅ Done | Touch controls, viewport fixes |
| iOS app | ✅ Done | Capacitor integration |

### Recent Development (January 29-30, 2026)

**January 29:**
- Fixed authentication flow and improved UI/UX
- Fixed audio double-play issue in React Strict Mode

**January 30:**
- Added guest mode (play Level 1 before signup)
- Updated Vite to fix esbuild security vulnerability
- Fixed mobile bugs: keyboard overlap, controls, viewport
- Fixed movement/control issues (stuck keys, mobile detection)

---

## Environment Setup

### Two Supabase Projects

| Environment | Project ID | URL |
|-------------|------------|-----|
| Development | `vgkpbslbfvcwvlmwkowj` | https://vgkpbslbfvcwvlmwkowj.supabase.co |
| Production | `zbtbtmybzuutxfntdyvp` | https://zbtbtmybzuutxfntdyvp.supabase.co |

### Key Differences

| Setting | Development | Production |
|---------|-------------|------------|
| Email confirmation | Disabled | Enabled |
| Database | Test data | Real user data |

---

## Database Status

Both environments have:
- ✅ All tables (users, user_stats, game_sessions)
- ✅ Auth trigger (`on_auth_user_created`) enabled
- ✅ Function (`handle_new_user()`) with error handling
- ✅ RLS policies (8 policies) configured

---

## What's Next

### Ready for Production Deployment
The app is feature-complete and ready to deploy. See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

### Future Enhancements (Optional)
- Custom SMTP for branded emails (see [CUSTOM_EMAIL_SETUP.md](CUSTOM_EMAIL_SETUP.md))
- Background/level visual improvements (see [BACKGROUND_REFACTOR_PLAN.md](BACKGROUND_REFACTOR_PLAN.md))
- App Store submission for iOS (see [app-store/SUBMISSION_GUIDE.md](app-store/SUBMISSION_GUIDE.md))

---

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Switch to production environment locally
./scripts/switch-env.sh prod

# Switch back to development
./scripts/switch-env.sh dev
```

---

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main game component |
| `src/services/authService.ts` | Authentication logic |
| `src/lib/supabase.ts` | Supabase client |
| `database/schema.sql` | Full database schema |
| `.env.local` | Environment configuration |

---

## Documentation Index

- **Setup:** `docs/setup/` - Backend, iOS, environments, MCP
- **Reference:** `docs/reference/` - Developer info, signing, testing
- **App Store:** `docs/app-store/` - Submission guide
- **Troubleshooting:** `docs/TROUBLESHOOTING_AUTH.md` - Auth issues

---

## Resolved Issues

### Authentication (Fixed Jan 29, 2026)
- **Issue:** "User profile was not created by trigger" error
- **Root cause:** Missing/outdated database trigger
- **Fix:** Updated trigger function with error handling, increased retry timeout
- **Status:** ✅ Fully resolved

### Mobile Controls (Fixed Jan 30, 2026)
- **Issue:** Keyboard overlap, stuck keys, viewport problems
- **Fix:** Optimized mobile detection, fixed keysRef clearing, viewport adjustments
- **Status:** ✅ Fully resolved

### Audio (Fixed Jan 29, 2026)
- **Issue:** Double-play in React Strict Mode
- **Fix:** Proper audio cleanup and state management
- **Status:** ✅ Fully resolved
