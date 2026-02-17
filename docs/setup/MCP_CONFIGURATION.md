# MCP Configuration

**Last Updated:** January 23, 2026  
**Status:** ✅ **COMPLETE - MCP Working and Tested**

## Overview

The Supabase MCP (Model Context Protocol) server is configured and working. This allows automated database operations through Cursor.

## Current Configuration

**File:** `~/.cursor/mcp.json` (global config, outside project directory)

**Configuration:**
```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--access-token",
    "<your-supabase-personal-access-token>"
  ]
}
```

**Status:** ✅ Working - Connection tested and verified

## Why Global Config?

The MCP configuration uses a Personal Access Token (PAT) stored in the **global config** (`~/.cursor/mcp.json`) because:

- ✅ **Secure:** Global config is outside project directory - token will never be leaked when sharing projects
- ✅ **Works:** Connection tested and verified
- ✅ **Safe location:** `~/.cursor/mcp.json` is in home directory, not in any project
- ✅ **Can revoke:** Token can be revoked anytime from Supabase dashboard

## Connection Test Results

**Test Performed:** Listed Supabase projects using MCP

**Results:** ✅ **SUCCESS**
- Successfully connected to Supabase
- Found projects including:
  - **"micro-biz-dash"** (ID: `zbtbtmybzuutxfntdyvp`) - Status: ACTIVE_HEALTHY
  - Region: us-west-2
  - Database: PostgreSQL 17.6.1.063
- MCP tools are ready to use for database operations

## Available MCP Tools

With MCP configured, you can use Supabase MCP tools for:
- ✅ Listing database tables
- ✅ Running SQL queries
- ✅ Creating migrations
- ✅ Managing your Supabase project

## Troubleshooting

### If MCP Says "Unauthorized"

1. **Check Cursor Settings:**
   - Cursor → Settings → Features → Model Context Protocol (MCP)
   - Look for "supabase" in the MCP servers list
   - Verify it's enabled

2. **Check Global Config:**
   - Verify `~/.cursor/mcp.json` exists
   - Check that the access token is correct

3. **Restart Cursor:**
   - After making changes, restart Cursor to reload configuration

### If You Want to Use OAuth Instead

Cursor currently has a limitation with OAuth flows for remote MCP servers. When OAuth support is added, we can switch to that method (no code changes needed, just update config).

## Security Notes

### Why This Approach is Better

**Token-Based (Current):**
- ✅ Token stored in global config (outside project)
- ✅ Safe to share projects (no secrets in project files)
- ✅ Can be revoked anytime

**Future OAuth-Based:**
- ✅ No tokens in config files
- ✅ Browser-based authentication
- ✅ Works globally with one authentication

## File Locations

### Global Config (Active)
- **Path:** `~/.cursor/mcp.json` (Mac/Linux) or `%APPDATA%\Cursor\User\mcp.json` (Windows)
- **Status:** ✅ **Working** - Contains Supabase MCP with PAT
- **Security:** Safe - Outside project directory, won't be shared

## Reference

- **Supabase MCP Docs:** https://supabase.com/docs/guides/getting-started/mcp
- **OAuth Authentication:** https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication
