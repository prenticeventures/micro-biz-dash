# Project Status

**Last Updated:** February 3, 2026

## Overview

Micro-Biz Dash is a retro-style platformer game where players guide an entrepreneur through the stages of building a business. The game features:

- 5 themed levels (Garage → City → Tech → Finance → Victory)
- Lives system and game state persistence
- User authentication with Supabase
- Public leaderboard
- Guest mode (play Level 1 before signing up)
- iOS app support via Capacitor

---

## Current Status: ✅ Production Ready (Core) | 🔄 Background Refactor In Progress

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

### Background Refactor - In Progress

**NOTE:** Session 2 (Feb 3) attempted Option A but broke gameplay. A full revert of `levelGenerator.ts` was required. The generator is back to its original state. Only the renderer changes in `GameCanvas.tsx` survived. See [BACKGROUND_REFACTOR_PLAN.md](BACKGROUND_REFACTOR_PLAN.md) for the 3-step plan for Session 3.

| Goal | Status | Notes |
|------|--------|-------|
| Separate RNG for background | ❌ Not done | Was reverted; Step 1 of Session 3 plan |
| Match parallax rates | ✅ Done | Renderer uses 0.2 for terrain + decorations |
| Objects on top of terrain | ✅ Done | Offscreen canvas compositing in GameCanvas.tsx |
| Faded "distant" look | ✅ Done | CSS filter: `saturate(0.5) brightness(1.2)` |
| Extend terrain to full level width | ❌ Not done | Step 2 of Session 3 plan |
| Objects anchored to surfaces | ❌ Not done | Step 3 of Session 3 plan |

**Current Issue:** Generator is back to original. Background objects have random Y (float), terrain only covers 800px, and background + gameplay share one RNG. Three problems, clear 3-step fix plan ready to execute.

### Recent Development

**January 29-30, 2026:**
- Fixed authentication flow and improved UI/UX
- Fixed audio double-play issue in React Strict Mode
- Added guest mode (play Level 1 before signup)
- Updated Vite to fix esbuild security vulnerability
- Fixed mobile bugs: keyboard overlap, controls, viewport

**February 2, 2026:**
- Created `feature/background-refactor` branch
- Implemented layer-based rendering (offscreen canvas)
- Fixed parallax mismatch (all objects now use 0.2)
- Added CSS filter for faded "distant" look
- Objects render on top of terrain (no transparency bleed)
- **Blocking issue identified:** Object Y positions don't track terrain shape

**February 3, 2026:**
- Attempted Option A (extend terrain + X→Y lookup) — broke gameplay (level 2 unwinnable)
- Root cause: changes to the generator shifted the shared RNG sequence, moving platforms and creating impassable gaps
- **Process fix:** Created `tests/gameplay-baseline.json` — a ground-truth snapshot of all gameplay entities across all 5 levels
- **Process fix:** Added Rule 4 to `.claude/CLAUDE.md` — mandatory baseline verification after any `levelGenerator.ts` change (runnable JS snippet included)
- Fully reverted `levelGenerator.ts` to git HEAD; verified ALL 5 LEVELS PASS against baseline
- Re-assessed current state; identified 3 problems and a safe 3-step fix plan (see BACKGROUND_REFACTOR_PLAN.md)
- **GameCanvas.tsx renderer changes were NOT reverted** — offscreen canvas, sky, terrain drawing, CSS filter all still in place

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
| `tests/gameplay-baseline.json` | Ground-truth gameplay entity snapshot (all 5 levels). Used by Rule 4 verification. |

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
