# Background & Level Aesthetics Refactor Plan

**Last Updated:** February 4, 2026
**Status:** ✅ Phase 1 (Bug Fixes) Complete | 🔄 Phase 2 (Visual Richness) In Progress
**Branch:** `feature/background-refactor`

---

## CRITICAL WARNING

**This refactor affects ONLY background/visual elements. DO NOT modify:**
- Platform positions or sizes
- Gap sizes between platforms
- Enemy placement or behavior
- Collectible positions
- Player physics or movement

**The level generator uses a seeded RNG.** Use a SEPARATE `bgRng` for background changes to avoid affecting gameplay. See `.cursorrules` for details.

---

## Progress Tracker

### Phase 1: Bug Fixes ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Separate `bgRng` | ✅ Done | `bgRng = new SeededRNG(levelIndex * 12345)` |
| Gameplay RNG preserved | ✅ Done | Burn block replays original `rng` calls so gameplay state is identical. No baseline regen needed. |
| Terrain covers full level | ✅ Done | Loop runs to `levelWidth` |
| `getTerrainYAtX` lookup | ✅ Done | Linear interpolation across terrain polygon |
| Objects anchored to terrain | ✅ Done | bg objects placed at `getTerrainYAtX(x)` |
| Layer-based rendering | ✅ Done | Offscreen canvas (`bgLayerCanvasRef`) |
| Objects on top of terrain | ✅ Done | Composited at full opacity over terrain polygon |
| Faded "distant" look | ✅ Done | CSS filter: `saturate(0.5) brightness(1.2)` |
| Level-specific sky | ✅ Done | `drawSky()` has per-level gradients |
| Y-sorted decoration draw | ✅ Done | Further objects drawn first |

### Phase 2: Visual Richness — What's Next

| Task | Priority | Where | Notes |
|------|----------|-------|-------|
| Sky cloud layer | 1 | Renderer | Clouds in sky (Y: 30–150), parallax 0.05. Sky is currently empty. |
| Far silhouette layer | 2 | Renderer | Second darker polygon behind current terrain, parallax 0.1 |
| Parallax differentiation | 3 | Renderer | Clouds 0.05, far mountains 0.1, terrain 0.2. Only new layers change speed. |
| Sky gradient enrichment | 4 | constants.ts | Third color stop per level (horizon color). |
| Fix matrix rain (L3) | 5 | Renderer | Uses `Math.random()` every frame — flickers as noise. Needs seeded scroll or removal. |
| Background object variety | 6 | Generator | 2–3 sprites per level instead of 1. Uses `bgRng` only. |

---

## The Blocking Problem — ✅ RESOLVED

Objects no longer float. Terrain extends to full level width via `bgRng`, `getTerrainYAtX` provides the lookup, and all bg objects are placed at the terrain surface. The `rng` burn block preserves gameplay exactly. See Phase 1 in Progress Tracker above.

---

## Approaches Tried (Feb 2, 2026)

### Attempt 1: Fixed Horizon Line
- Set all objects to a single Y (e.g., `CANVAS_HEIGHT - 180`)
- **Result:** Objects still float when terrain dips below that line

### Attempt 2: Y Range Based on Scale
- Smaller objects (further) at higher Y, larger objects (closer) at lower Y
- **Result:** Creates some variety but still doesn't match terrain shape

### Attempt 3: Layer-Based Rendering
- Draw objects to offscreen canvas, composite at 100% opacity
- **Result:** Fixed the terrain-bleed-through problem, but Y positioning still wrong

---

## Session 2 Retrospective (February 3, 2026)

### What Happened
Option A was chosen and implemented: terrain loop extended to `levelWidth`, `getTerrainYAtX` lookup function added, background object Y positions set via lookup. The approach used a conditional RNG switch (`bgX < CANVAS_WIDTH ? rng : bgRng`) intended to keep the gameplay `rng` call count unchanged.

### What Went Wrong
The gameplay was broken — level 2 became unwinnable (giant impassable gap). The conditional RNG switch did not preserve the exact sequence because the version being edited already had other uncommitted changes (sky/horizon/landmarks from Session 1) interacting with the terrain loop in ways that shifted call counts.

### What Was Fixed (Process)
1. **Baseline snapshot created:** `tests/gameplay-baseline.json` records all non-DECORATION entities (position, size, type) for all 5 levels, generated from known-good code.
2. **Rule 4 added to `.claude/CLAUDE.md`:** Mandatory verification — after ANY change to `levelGenerator.ts`, run the included JS snippet against the baseline. All 5 levels must PASS before the change is accepted. A screenshot is explicitly NOT a valid test.

### What Was Rolled Back
`git checkout -- utils/levelGenerator.ts` — full revert to git HEAD. Verified ALL 5 LEVELS PASS against baseline. `GameCanvas.tsx` was NOT reverted (renderer changes are safe).

### Key Lesson
**Do not touch the shared `rng` until it is replaced by `bgRng`.** The RNG decoupling (Step 1 below) MUST happen first, and the baseline must be regenerated from that new code, before any other generator changes are attempted.

---

## Original Vision

### 1. Vision: "Painting a Picture"
Move from random, independent object placement to **Scene Composition**. The background should tell a story of a journey through different "zones" rather than being a random soup of icons.

### 2. Core Concepts

#### A. The "Zone" System (Vertical Anchoring)
*   **Sky Zone (Top 0-25%):** ❌ Empty. Clouds are on terrain, not in the sky. Phase 2 Priority 1 adds a proper sky cloud layer here.
*   **Horizon Zone (Middle 25-70%):** ✅ Objects anchored to terrain. Only one silhouette layer though — Phase 2 Priority 2 adds a second (far mountains).
*   **Ground Decor (Foreground):** ✅ Tied to platform coordinates, gameplay layer.

#### B. "Scene Clusters" (Horizontal Grouping)
*   Not a current priority. Objects are randomly distributed. May revisit after Phase 2.

#### C. Multi-Layer Parallax
*   **Current state:** Terrain and bg objects all at 0.2. This was done to prevent sliding.
*   **Phase 2 plan:** Differentiate NEW layers only. Clouds at 0.05, far mountains at 0.1. Things that visually sit on the terrain stay at 0.2. Key insight: only layers that touch the terrain need to match its speed. Sky and far-background layers can move independently.

### 3. Level-Specific Themes

| Level | Theme | Background Elements | Status |
| :--- | :--- | :--- | :--- |
| **1: Garage** | Bright Start | ☁️ on terrain (single sprite) | Sky gradient ✅ / Anchored ✅ / Variety ❌ |
| **2: City** | The Hustle | 🏢 on terrain (single sprite) | Sky gradient ✅ / Anchored ✅ / Variety ❌ |
| **3: Tech** | The Matrix | "10" on terrain (single sprite) | Sky gradient ✅ / Anchored ✅ / Matrix rain broken ❌ |
| **4: Finance** | The Burnout | 📉 on terrain (single sprite) | Sky gradient ✅ / Anchored ✅ / Variety ❌ |
| **5: Victory** | IPO / Growth | 💔 on terrain (single sprite) | Sky gradient ✅ / Anchored ✅ / Variety ❌ |

*Each level currently uses one repeated `bgSprite`. Phase 2 Priority 6 adds variety (2–3 sprites per level). Phase 2 Priority 1 adds sky clouds that are actually in the sky.*

---

## Success Criteria

| Criterion | Status |
|-----------|--------|
| No more "floating" buildings in mid-air | ✅ Met (getTerrainYAtX anchoring) |
| Sky feels alive (clouds, depth) | ❌ Phase 2 Priority 1–2 |
| Sense of depth between layers | ❌ Phase 2 Priority 2–3 (far mountains + parallax differentiation) |
| Clear vertical separation between clouds and ground items | ❌ Phase 2 Priority 1 (clouds are currently on terrain, not sky) |
| Objects are grouped into logical "clusters" | ❌ Future work |
| Background has visual variety per level | ❌ Phase 2 Priority 6 |
| Level 3 matrix rain looks intentional | ❌ Phase 2 Priority 5 |
| Objects render on top of terrain (no bleed-through) | ✅ Met (offscreen canvas) |
| Faded "distant" look for background layer | ✅ Met (CSS filter) |

---

## Files Modified

| File | Changes |
|------|---------|
| `utils/levelGenerator.ts` | `bgRng`, terrain to `levelWidth`, `getTerrainYAtX`, burn block. Phase 2 will add `farTerrain` and bg sprite variety. |
| `components/GameCanvas.tsx` | `drawSky`/`drawTerrain`, offscreen canvas, CSS filter. Phase 2 will add cloud layer, far mountain layer, fix matrix rain. |
| `constants.ts` | Phase 2 will add third sky gradient stop per level. |
| `types.ts` | Phase 2 Priority 2 will add `farTerrain?: Vector[]` to `LevelData`. |
| `tests/gameplay-baseline.json` | Ground-truth entity snapshot for Rule 4 verification. |
| `.claude/CLAUDE.md` | Rule 4: mandatory baseline verification after generator changes |

---

## Phase 1 Plan — 3-Step Fix ✅ COMPLETE

All three steps done. The burn block at `levelGenerator.ts:197–209` replays the exact `rng` calls the original background loops made, so gameplay state is byte-identical. No baseline regeneration was needed.

---

## Phase 2 Plan — Visual Richness

All items below are background-only. Zero gameplay risk. Priorities are ordered by visual impact.

### Priority 1: Sky Cloud Layer
**Where:** `GameCanvas.tsx` — inside `drawSky()`, drawn after the gradient, before returning.

**What:** A set of clouds that live in the sky (Y: 30–150px) and scroll at 0.05x parallax — very slow drift. Drawn directly with `ctx.fillText` on the main canvas, NOT through the decoration/offscreen-canvas pipeline (those are for terrain-layer objects).

**Why:** The sky is currently an empty gradient. This is the single biggest visual gap. Classic SNES games had slowly drifting clouds as the farthest layer. The ☁️ sprite currently used as `bgSprite` on L1 sits on the terrain — it doesn't read as a sky cloud.

**Implementation notes:**
- Use a seeded cloud layout (positions derived from `level` number, not `Math.random()`) so clouds don't jump around on re-render.
- 4–6 clouds per level at different X positions and sizes.
- Semi-transparent white fills (not emoji) would look more like classic silhouette clouds. Emoji is fine too.
- Parallax: `cloudX - (cameraXRef.current * 0.05)`
- Draw BEFORE terrain so terrain occludes clouds at the horizon.

---

### Priority 2: Far Silhouette Layer
**Where:** `GameCanvas.tsx` — new function `drawFarMountains()`, called after `drawTerrain()` but BEFORE the offscreen decoration composite. Actually: drawn AFTER sky, BEFORE current terrain. Order: sky → far mountains → mid terrain → decorations → gameplay.

**What:** A second filled polygon, darker than the current terrain, at 0.1x parallax. Represents distant mountains/buildings/treeline depending on level.

**Why:** Classic SNES depth trick. Two silhouette layers at different speeds is what creates the "wow, that's far away" feeling. One layer (current state) reads as flat. Two layers reads as landscape.

**Implementation notes:**
- Generate a second terrain polygon in `levelGenerator.ts` using `bgRng`. Can reuse similar wavy logic but with different amplitude. Store as `farTerrain` in `LevelData` (add to type).
- Color: take the current terrain color and make it darker (e.g., multiply RGB by 0.6).
- Parallax: 0.1x.
- Shape should be smoother/gentler than mid terrain (fewer peaks, less amplitude). Far things look smoother.

---

### Priority 3: Parallax Differentiation
**Where:** Already falls out of Priorities 1 and 2. Clouds at 0.05, far mountains at 0.1, current terrain at 0.2. No code change needed beyond what 1 and 2 introduce.

**Why:** Currently everything moves at 0.2. The depth is invisible. Classic SNES used sharp speed differentials (0.1 vs 0.5) to sell depth. The reason everything was locked to 0.2 before ("objects slide off terrain") only applies to things visually touching the terrain. Sky and far-background layers float freely.

---

### Priority 4: Sky Gradient Enrichment
**Where:** `constants.ts` — the `SKY_LEVEL_*` arrays. Currently 2 entries each (top color, bottom color).

**What:** Add a third color stop to each level's sky. This becomes the horizon color — warmer/brighter than the zenith.

**Why:** A 2-stop gradient across 600px of vertical space is flat. Classic SNES skies had 3–4 color bands. The horizon is always a different temperature than the top of the sky (warm sunset horizon vs cool blue zenith, etc.).

**Implementation notes:**
- Change sky arrays from `[top, bottom]` to `[top, mid, bottom]`.
- Update `drawSky()` gradient stops: top at 0, mid at ~0.4–0.5, bottom at 1.0.
- Suggested horizon colors per level:
  - L1 (daylight): warm white `#FFF8E1`
  - L2 (golden afternoon): deep orange `#E65100`
  - L3 (matrix): dark green `#0A2E0A`
  - L4 (cold office): slate `#546E7A`
  - L5 (stormy): deep purple `#1A0033`

---

### Priority 5: Fix Matrix Rain (Level 3)
**Where:** `GameCanvas.tsx` lines 341–346 in `drawSky()`.

**What:** Currently draws 20 characters at `Math.random()` positions every frame. This produces random flickering noise, not a falling effect.

**Fix options (pick one):**
- **Option A:** Remove it entirely. The dark green sky + binary `bgSprite` on terrain already sells the tech theme. Simpler is better.
- **Option B:** Replace with a seeded, scrolling column system. Each column has a fixed X, characters scroll downward (Y increases over time, wraps). Use `Date.now()` for scroll offset so it animates smoothly. Use level number as seed for column positions.

**Why:** Background animation violates the classic SNES principle that motion should be reserved for the gameplay layer (it draws the eye away from the player). If we keep it, it needs to be smooth and calm, not flickering noise.

---

### Priority 6: Background Object Variety
**Where:** `levelGenerator.ts` — the background objects loop (currently lines ~182–195).

**What:** Instead of one `bgSprite` repeated for all bg objects, pick from a per-level array of 2–3 sprites.

**Why:** L1 is just ☁️☁️☁️☁️. L2 is just 🏢🏢🏢🏢. Monotonous. Classic games had variety within each layer.

**Implementation notes:**
- Add a `bgSpriteOptions` array per level in the switch block (same pattern as `decorOptions` for foreground).
- In the bg objects loop, pick sprite via `bgSpriteOptions[Math.floor(bgRng.next() * bgSpriteOptions.length)]`.
- Suggested palettes:
  - L1: `[☁️, 🌳, 🏡]` — clouds, trees, small houses
  - L2: `[🏢, 🏗️, 🌆]` — buildings, construction
  - L3: `[🗄️, 💻, 🔌]` — servers, computers
  - L4: `[📊, 🏦, 📑]` — charts, bank, documents
  - L5: `[🌋, 🪨, ⚡]` — volcanic elements
- Uses `bgRng` only. Zero gameplay risk.

---

### Execution Rules (Phase 2)
- Priorities 1, 4, 5 are renderer-only (`GameCanvas.tsx` / `constants.ts`). No Rule 4 check needed.
- Priority 2 adds `farTerrain` to the generator and `LevelData` type. Run Rule 4 after. Should PASS (no gameplay entities touched).
- Priority 6 changes the generator bg loop. Run Rule 4 after. Should PASS (only DECORATION entities change).
- Do not modify any gameplay code.
