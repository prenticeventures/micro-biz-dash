# Claude Code Agent

This is the Claude Code agent configuration for the Micro Biz Dash project.

## Project Overview

This is a React/TypeScript game application built with:
- React 18
- TypeScript
- Vite
- Capacitor (for iOS mobile app)
- Supabase (for backend/database)

## Key Directories

- `src/` - Main source code
- `components/` - React components
- `ios/` - iOS native app configuration
- `scripts/` - Build and deployment scripts
- `database/` - Database schema files

## Common Tasks

- Building and testing the iOS app
- Managing Supabase database
- Deploying to App Store
- Testing game features
- Code reviews and refactoring

## Important Documentation

- **[MCP Setup Guide](../docs/MCP_SETUP_GUIDE.md)** - How to configure Claude Code to access Supabase and other services
- **[Current Debug Session](../docs/CURRENT_DEBUG_SESSION.md)** - Active debugging notes and discoveries
- `database/schema.sql` - Complete database schema with triggers
- `database/add-auth-trigger.sql` - Critical auth trigger (must be applied to new Supabase projects)

## Guidelines

- Always test changes before committing
- Follow TypeScript best practices
- Ensure iOS builds work before deployment
- Keep code simple and well-commented (user is a beginner)

## MCP Setup (Required for Database Access)

Claude Code needs MCP configured to query Supabase databases.

**Quick setup for this project:**
```bash
claude mcp add --transport stdio --scope user supabase -- \
  npx -y @supabase/mcp-server-supabase@latest \
  --access-token YOUR_SUPABASE_ACCESS_TOKEN
```

**Full MCP documentation:** `~/claude.md` (global guide for all projects)
**Project-specific guide:** [docs/MCP_SETUP_GUIDE.md](../docs/MCP_SETUP_GUIDE.md)
