# Fix MCP Configuration - Step by Step

The MCP config file exists, but Cursor needs to recognize it. Here's how to fix it:

## Option 1: Enable MCP in Cursor Settings (Recommended)

1. **Open Cursor Settings:**
   - Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
   - Or: **Cursor** → **Settings** (menu bar)

2. **Search for "MCP":**
   - In the search bar at the top, type: `MCP`
   - Or navigate to: **Features** → **Model Context Protocol**

3. **Check MCP Status:**
   - Look for "MCP Servers" or "MCP Tools" section
   - See if "supabase" is listed
   - If it shows as **disabled** or **not connected**, enable it

4. **If Supabase MCP is NOT listed:**
   - Look for **"Add Custom MCP"** or **"Add MCP Server"** button
   - Click it
   - It should detect the `.cursor/mcp.json` file automatically
   - Or manually point it to the config

5. **If you see Supabase but it needs the token:**
   - Click on the "supabase" entry
   - Look for **"Access Token"**, **"Environment Variables"**, or **"Config"**
   - Add: `<your-supabase-personal-access-token>`
   - Save

6. **Restart Cursor** after making changes

## Option 2: Use Hosted Supabase MCP (No PAT Needed)

If the above doesn't work, we can switch to Supabase's hosted MCP which uses browser OAuth:

1. I'll update `.cursor/mcp.json` to use: `https://mcp.supabase.com/mcp`
2. When you use MCP tools, Cursor will open a browser for you to log into Supabase
3. You grant access once, and it works from then on

This is actually **easier** than using a PAT!

## Option 3: Global MCP Config

If project-level config doesn't work, we can put it in your home directory:

- **Mac:** `~/.cursor/mcp.json`
- **Windows:** `%APPDATA%\Cursor\User\mcp.json`
- **Linux:** `~/.config/Cursor/User/mcp.json`

---

**Try Option 1 first** - check Cursor Settings → MCP and see what's there. Let me know what you find!
