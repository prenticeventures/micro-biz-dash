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

## CRITICAL RULES - Game Development

### 1. Levels Must ALWAYS Be Winnable
**NEVER make changes that could make a level unwinnable.** This includes:
- Gaps that are too large to jump over
- Platforms that are unreachable
- Enemies that are impossible to avoid
- Goals that cannot be reached

**See Rule 4 below for the mandatory verification procedure. A screenshot is NOT a test.**

### 2. Separate Background from Gameplay
When working on visual/background changes:
- **Background** = decorations, parallax, sky, visual effects (safe to modify)
- **Gameplay** = platforms, gaps, enemies, collectibles, player movement (be very careful)

**DO NOT modify gameplay elements when working on background aesthetics.**

### 3. Preserve RNG Sequences for Gameplay
The level generator uses a seeded RNG. If you change how many times `rng.next()` is called before gameplay generation, you will change ALL platform placements, gaps, and enemy positions.

**Solution:** Use a SEPARATE RNG for background decorations (`bgRng`) that doesn't affect gameplay RNG (`rng`).

```typescript
// CORRECT - Two separate RNGs
const rng = new SeededRNG(levelIndex * 999);     // For gameplay - DO NOT MODIFY
const bgRng = new SeededRNG(levelIndex * 12345); // For background only
```

### 4. MANDATORY: Gameplay Snapshot Verification
**This is not optional. Do not mark any change to `levelGenerator.ts` as done without running this check.**

A baseline snapshot of all gameplay entities (platforms, enemies, collectibles, goal) for all 5 levels is committed in `tests/gameplay-baseline.json`. This is ground truth.

**After ANY change to `levelGenerator.ts`, before you do anything else:**

1. Open the dev server in a headless browser (or the browser console at `localhost:3000`)
2. Run this code:

```javascript
const { generateLevel } = await import('/utils/levelGenerator.ts');
const baseline = await (await fetch('/tests/gameplay-baseline.json')).json();
let allMatch = true;

for (let lvl = 1; lvl <= 5; lvl++) {
  const data = generateLevel(lvl);
  const current = data.entities
    .filter(e => e.type !== 'DECORATION')
    .map(e => ({ id: e.id, type: e.type, x: e.pos.x, y: e.pos.y, width: e.size.width, height: e.size.height }));
  const expected = baseline[`level_${lvl}`].entities
    .map(({ id, type, x, y, width, height }) => ({ id, type, x, y, width, height }));

  const match = JSON.stringify(current) === JSON.stringify(expected);
  console.log(`Level ${lvl}: ${match ? 'PASS' : 'FAIL'} (${current.length} entities)`);
  if (!match) {
    allMatch = false;
    // Show first difference
    for (let i = 0; i < Math.max(current.length, expected.length); i++) {
      if (JSON.stringify(current[i]) !== JSON.stringify(expected[i])) {
        console.log('  First diff at index', i);
        console.log('  Expected:', JSON.stringify(expected[i]));
        console.log('  Got:     ', JSON.stringify(current[i]));
        break;
      }
    }
  }
}
console.log(allMatch ? 'ALL LEVELS PASS' : 'GAMEPLAY BROKEN - DO NOT PROCEED');
```

3. **ALL 5 levels must print PASS.** If any level prints FAIL, the change shifted the gameplay RNG or otherwise altered entity layout. Stop and fix before proceeding.

**Why screenshots fail:** Screenshots only show one camera position on one level. A shifted RNG can create an impassable gap 1200px into a level that no screenshot will catch.

**If you cannot run this verification, do not proceed with the change.**

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
