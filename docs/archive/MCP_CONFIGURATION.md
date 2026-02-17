# MCP Configuration - Automated Setup

I've created the MCP configuration file at `.cursor/mcp.json` with your Supabase access token.

## What I Did

✅ Created `.cursor/mcp.json` with your Supabase access token configured (using `--access-token`)

## If MCP Still Says "Unauthorized" After Restart

Cursor may use a **different** Supabase MCP (e.g. built-in) that doesn't read `.cursor/mcp.json`. Try this:

1. **Open Cursor Settings** → search for **"MCP"** or go to **Features** → **Model Context Protocol**.
2. **Check the MCP list** for any **Supabase**-related server.
3. **If you see one:** 
   - Click it and look for **"Access token"**, **"SUPABASE_ACCESS_TOKEN"**, or **"Environment variables"**.
   - Add your token: `<your-supabase-personal-access-token>`
4. **If you can "Add Custom MCP":**  
   Use that and point it at the config in this project; ensure the Supabase server you add uses the token.

## Verify It's Working

After configuring, I'll test the connection. If it works, I'll:
1. Find your project
2. Create all the database tables
3. Set up everything automatically

## Alternative: Manual Setup

If MCP still doesn't work, we use the **manual SQL** approach: one copy/paste of `database/schema.sql` into the Supabase SQL Editor. It's quick and reliable.

---

**Next Step:** Check Cursor Settings → MCP for Supabase and add the token there if needed. Then I can retest.
