# Current Debugging Session - Authentication Issues

**Date:** 2026-01-27
**Last Updated:** 2026-01-27 (Evening)
**Status:** 🔄 IN PROGRESS - Production Trigger Fixed, Testing Blocked by Rate Limit

## Problem Statement
User is getting immediate signup errors. No confirmation emails received. Initially assumed rate limit, but that was incorrect.

## What We've Discovered

### 1. Environment Setup ✅
- **Two Supabase projects exist:**
  - Dev: `micro-biz-dash-dev` (vgkpbslbfvcwvlmwkowj)
  - Prod: `micro-biz-dash` (zbtbtmybzuutxfntdyvp)

### 2. API Keys Are CORRECT ✅
- Verified dev project publishable key in `.env.local` is correct
- Key: `sb_publishable_7EPoMgV5Bsec_-yV7rF2qg_XobTArmb`
- URL: `https://vgkpbslbfvcwvlmwkowj.supabase.co`
- Connection credentials are NOT the problem

### 3. MCP Configuration - FIXED ✅
- **Discovery:** Cursor (`~/.cursor/mcp.json`) and Claude Code (`~/.claude.json`) have SEPARATE configs
- **Issue:** MCP configured in Cursor doesn't auto-work in Claude Code CLI
- **Fix:** Added Supabase MCP to Claude Code with `claude mcp add`
- **Verification:** `claude mcp list` shows Supabase ✓ Connected
- **Documentation:** Created `~/claude.md` as global MCP reference for all projects
- **Note:** MCP servers load at session startup (need to restart Claude after changes)

## What We Still Need to Check

### 1. Database Schema in Dev Project
- Need to verify these tables exist in dev project:
  - `users`
  - `game_sessions`
  - `user_stats`
- Schema might not have been applied to dev project

### 2. Missing Database Trigger
- Code in `src/services/authService.ts:42-65` expects a trigger to auto-create user profiles
- The `database/schema.sql` file does NOT include this trigger
- Need to create trigger that fires on `auth.users` insert to create corresponding `users` and `user_stats` entries

## ROOT CAUSE IDENTIFIED ✅
The authentication error occurs because:
1. **Missing Database Trigger**: The code in `authService.ts:42-65` expects a trigger to auto-create user profiles
2. **Schema Was Incomplete**: The `database/schema.sql` file was missing the `handle_new_user()` trigger
3. **How It Broke**: When users sign up:
   - Supabase Auth creates entry in `auth.users` ✅
   - **Missing trigger** should create entries in `public.users` and `public.user_stats` ❌
   - Code waits 2 seconds with retries for profile ⏱️
   - Profile never appears → throws "User profile was not created by trigger" error 💥

## THE FIX
Created two SQL files:
1. `database/add-auth-trigger.sql` - Standalone trigger to apply now
2. Updated `database/schema.sql` - Now includes trigger for future deployments

## CRITICAL DISCOVERY: Email Confirmations Are ENABLED! ⚠️
When we linked to the dev project, discovered:
- **Email confirmations ARE enabled** (`enable_confirmations = true`)
- The `.env.local` comment saying they're disabled is WRONG
- This means users MUST click email confirmation link before they can sign in
- Rate limit: 1 email per minute per address

## ✅ RESOLUTION COMPLETE

**Date Completed:** 2026-01-27

### What Was Fixed:
1. ✅ **Database schema verified** - All tables exist (users, user_stats, game_sessions)
2. ✅ **Trigger verified** - `on_auth_user_created` trigger exists and is ENABLED
3. ✅ **Function verified** - `handle_new_user()` function exists
4. ✅ **Email confirmation disabled** - Toggled OFF for dev environment
5. ✅ **Authentication tested** - User successfully signed up and profile was created automatically

### Verification Results:
- ✅ 1 user in `auth.users`
- ✅ 1 profile in `public.users` 
- ✅ 1 stats entry in `public.user_stats`
- ✅ All counts match - trigger is working correctly!

### Files Updated:
- `database/schema.sql` - Updated to include safe policy creation (IF NOT EXISTS patterns)
- `FIX_AUTH_CHECKLIST.md` - Added notes about expected warnings

## Files to Reference
- `.env.local` - Dev environment config
- `src/services/authService.ts` - Auth logic (lines 42-65 wait for trigger)
- `database/schema.sql` - Database schema (missing trigger)
- `src/lib/supabase.ts` - Supabase client config

## Important Notes
- DO NOT disable email confirmation until we know that's actually the problem
- The "rate limit" assumption in docs was wrong - error happens immediately
- User never received ANY confirmation emails

---

## PRODUCTION AUTHENTICATION FIX - January 27, 2026 (Evening)

### Problem
User reported "User profile was not created by trigger" error when testing production authentication locally.

### Root Cause
The production trigger function (`handle_new_user()`) was outdated and potentially had issues with RLS (Row Level Security) policies blocking the trigger's inserts.

### What We Fixed Today

1. ✅ **Updated Production Trigger Function**
   - Added error handling and logging to `handle_new_user()`
   - Function now logs warnings if inserts fail
   - Ensured SECURITY DEFINER is properly set (runs as postgres role, bypasses RLS)

2. ✅ **Increased Retry Timeout**
   - Updated `src/services/authService.ts` retry logic
   - Changed from 10 retries × 200ms (2 seconds) to 15 retries × 300ms (4.5 seconds)
   - Gives trigger more time to execute, especially with email confirmation flow

3. ✅ **Verified MCP Access**
   - Confirmed Supabase MCP token works for both dev and production
   - Token is account-level, not project-specific
   - Can access both projects: `zbtbtmybzuutxfntdyvp` (prod) and `vgkpbslbfvcwvlmwkowj` (dev)

4. ✅ **Verified Trigger Setup**
   - Trigger `on_auth_user_created` exists and is ENABLED on `auth.users`
   - Function `handle_new_user()` exists and is owned by `postgres` role
   - All necessary permissions granted

### Current Status
- ✅ Production trigger function updated and ready
- ✅ Code changes deployed to local dev server
- ⏳ **BLOCKED:** Rate limit preventing test signup
  - Error: "Too many signup attempts. Please wait a few minutes..."
  - Multiple test attempts triggered Supabase's IP-based rate limiting
  - Old unconfirmed user exists: `teeraprice@hotmail.com` (created Jan 23, never confirmed)

### Files Modified Today
- `src/services/authService.ts` - Increased retry timeout (lines 45-46)
- Production database - Updated `handle_new_user()` function via MCP

### Next Steps (Tomorrow)

1. **Test Production Authentication** ⏳
   - Wait for rate limit to reset (5-10 minutes)
   - Try signup with different email address OR wait and retry
   - Verify trigger creates user profile successfully
   - Check Supabase logs if trigger errors occur

2. **Verify Complete Flow** ⏳
   - Signup → Email confirmation → Login → Profile creation
   - Ensure all three tables get populated (auth.users, public.users, public.user_stats)

3. **If Trigger Still Fails** ⏳
   - Check Supabase logs for trigger execution errors
   - Consider adding fallback manual profile creation in authService
   - Verify RLS policies aren't blocking trigger inserts

4. **Production Deployment** ⏳
   - Once authentication verified, proceed with deployment checklist
   - Test game state saving/loading in production
   - Test leaderboard functionality

### Important Notes
- Production has email confirmation ENABLED (correct for security)
- Rate limiting is normal Supabase behavior to prevent abuse
- Trigger function now has error logging - check Supabase logs if issues persist
- MCP token works for both environments - no need for separate tokens
