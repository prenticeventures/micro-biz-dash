# Development and Production Environments

**Last Updated:** January 23, 2026

## Overview

The project uses separate Supabase projects for development and production, following best practices:

- **Development Project:** `micro-biz-dash-dev` (for testing)
- **Production Project:** `micro-biz-dash` (for live app)

## Projects

### Development Project
- **Project ID:** `vgkpbslbfvcwvlmwkowj`
- **URL:** `https://vgkpbslbfvcwvlmwkowj.supabase.co`
- **Publishable Key:** `sb_publishable_7EPoMgV5Bsec_-yV7rF2qg_XobTArmb`
- **Status:** ✅ Active and configured
- **Database Schema:** ✅ Applied
- **Email Confirmation:** ⏳ Should be disabled for development testing

### Production Project
- **Project ID:** `zbtbtmybzuutxfntdyvp`
- **URL:** `https://zbtbtmybzuutxfntdyvp.supabase.co`
- **Publishable Key:** `sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS`
- **Status:** ✅ Active
- **Database Schema:** ✅ Applied
- **Email Confirmation:** ✅ Enabled (for production security)

## Configuration

### Current Setup (Development)

The `.env.local` file is currently configured for **development**:

```env
VITE_SUPABASE_URL=https://vgkpbslbfvcwvlmwkowj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_7EPoMgV5Bsec_-yV7rF2qg_XobTArmb
```

### Switching to Production

To switch to production, edit `.env.local` and update the values:

```env
VITE_SUPABASE_URL=https://zbtbtmybzuutxfntdyvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS
```

Then restart your dev server.

## Required Setup Steps

### 1. Disable Email Confirmation in Dev Project

**This is critical for development testing!**

1. Go to: https://app.supabase.com/project/vgkpbslbfvcwvlmwkowj/auth/providers
2. Find the **Email** provider
3. **Uncheck** "Confirm email" or set it to disabled
4. Save changes

**Why:** This prevents rate limit errors during development testing.

### 2. Verify Database Schema

Both projects have the same schema applied:
- ✅ `users` table
- ✅ `game_sessions` table  
- ✅ `user_stats` table
- ✅ All RLS policies
- ✅ All triggers (including auto-create user profile)

## Benefits of Separate Projects

✅ **No rate limit issues in dev** - Can test signups freely  
✅ **Production stays secure** - Email confirmation enabled  
✅ **Isolated data** - Dev testing doesn't affect production  
✅ **Different configurations** - Each project can have different settings  
✅ **Safe to experiment** - Break things in dev without worry  

## Switching Between Environments

### Development (Current)
- Uses: `micro-biz-dash-dev` project
- Email confirmation: Disabled
- Safe for testing

### Production
- Uses: `micro-biz-dash` project  
- Email confirmation: Enabled
- Real user data

**To switch:** Edit `.env.local` and restart dev server.
