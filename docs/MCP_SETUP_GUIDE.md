# MCP Setup Guide for Claude Code

## What is MCP?

MCP (Model Context Protocol) allows Claude to connect to external services and tools like:
- **Supabase** - Query databases, check schema, run SQL
- **GitHub** - Create PRs, check issues, read repo data
- **Stripe** - Check payments, customers, subscriptions
- And many more...

## IMPORTANT: Cursor vs Claude Code MCP

**Key Point:** Cursor and Claude Code use **separate MCP configurations**!

```
~/.cursor/mcp.json     → Used by Cursor IDE MCP features
~/.claude.json         → Used by Claude Code CLI
```

If you configure MCP in Cursor, it will **not** automatically work in Claude Code CLI sessions. You need to set up both separately.

## How to Set Up MCP for Claude Code

### Step 1: Check Current MCP Servers

```bash
claude mcp list
```

If it says "No MCP servers configured", you need to add them.

### Step 2: Add MCP Servers

**General syntax:**
```bash
claude mcp add --transport stdio --scope user <server-name> -- <command> [args...]
```

**Common examples:**

#### Supabase MCP
```bash
claude mcp add --transport stdio --scope user supabase -- \
  npx -y @supabase/mcp-server-supabase@latest \
  --access-token YOUR_SUPABASE_ACCESS_TOKEN
```

#### GitHub MCP
```bash
claude mcp add --transport stdio --scope user github \
  --env GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN -- \
  npx -y @modelcontextprotocol/server-github
```

#### Airtable MCP
```bash
claude mcp add --transport stdio --scope user airtable \
  --env AIRTABLE_API_KEY=YOUR_KEY -- \
  npx -y airtable-mcp-server
```

### Step 3: Verify Setup

```bash
claude mcp list
```

You should see:
```
✓ Connected - server-name: command...
```

### Step 4: Start Claude Code Session

MCP servers are loaded when Claude Code starts. After adding servers, start a new session:

```bash
claude
```

The MCP tools will now be available in your session!

## Project-Specific Setup

### For This Project (Micro Biz Dash)

We use Supabase for our database. To enable database queries in Claude Code:

1. **Get your Supabase access token:**
   - Go to https://app.supabase.com/account/tokens
   - Generate a new token or use existing
   - Store it in `.env.local` as `SUPABASE_ACCESS_TOKEN`

2. **Add Supabase MCP to Claude Code:**
   ```bash
   claude mcp add --transport stdio --scope user supabase -- \
     npx -y @supabase/mcp-server-supabase@latest \
     --access-token YOUR_TOKEN_HERE
   ```

3. **Verify it's connected:**
   ```bash
   claude mcp list
   ```

4. **Start new Claude Code session:**
   ```bash
   cd /path/to/micro-biz-dash_-2026-edition
   claude
   ```

Now Claude can query your database, check schema, and help debug database issues!

## Troubleshooting

### "No MCP servers configured" even after adding

Make sure you used `--scope user` or `--scope local`. Check the config file:
```bash
cat ~/.claude.json
```

### MCP tools not available in current session

MCP servers load at session startup. Exit and start a new session:
```bash
exit
claude
```

### Connection errors

Verify your credentials are correct:
- Check environment variables are set properly
- Test API tokens manually (e.g., `supabase projects list`)
- Check network connectivity

### "Transport type not supported"

Always use `--transport stdio` for npx-based MCP servers.

### Want to remove an MCP server?

```bash
claude mcp remove <server-name>
```

## Best Practices

1. **Use user scope for personal projects:** `--scope user`
   - Config stored in `~/.claude.json`
   - Available across all your projects

2. **Use local scope for project-specific servers:** `--scope local`
   - Config stored in project's `.claude.json`
   - Only available in that project

3. **Never commit access tokens to git**
   - Store tokens in `.env.local` or environment variables
   - Add `.claude.json` to `.gitignore` if using local scope with secrets

4. **Test MCP connection before debugging**
   - Run `claude mcp list` to verify servers are connected
   - Look for ✓ Connected status

5. **Update MCP servers regularly**
   - MCP servers use `npx -y` which fetches latest version
   - Ensures you have newest features and bug fixes

## Related Files

- `.env.local` - Store access tokens here (gitignored)
- `~/.claude.json` - Claude Code user MCP config
- `.claude.json` - Project-local MCP config (if used)
- `~/.cursor/mcp.json` - Cursor IDE MCP config (separate from Claude Code)

## Additional Resources

- [Claude Code MCP Documentation](https://docs.anthropic.com/claude/docs/mcp)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)
