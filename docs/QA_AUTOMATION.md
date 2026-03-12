# QA Automation Guide

This project now uses automated quality gates to prevent broken builds from shipping.

Current product default: online services are disabled via feature flag, so auth/cloud-save/leaderboard checks are optional until that flag is turned back on.

## Standard Commands

- `npm run qa:standard` is the default merge gate. It runs the web quality gate plus Playwright smoke coverage.
- `npm run qa:release` is the default iPhone release gate. It runs the full iOS quality gate, including the packaged simulator smoke test.
- `npm run qa:live` is the live production smoke gate. It checks the deployed web app, and only probes the real backend when online services are enabled.

Use [Standard Testing Procedure](STANDARD_TESTING_PROCEDURE.md) as the team-facing policy doc. Use this file for the technical details of what each gate does.

## What Is Automated

### 1) Web Quality Gate (`npm run qa:web`)
- TypeScript typecheck (`npm run typecheck`)
- Unit/component tests (`npm run test:ci`)
- Production build (`npm run build`)
- Supabase target verification in built bundle when online services are enabled

### 2) iOS Quality Gate (`npm run qa:ios`)
- Runs all web quality gate checks above
- Syncs web bundle into iOS (`npm run ios:sync`)
- Verifies synced iOS bundle points to expected Supabase project ref when online services are enabled
- Boots an iPhone simulator, builds the Capacitor app, and runs the packaged level-1 -> level-2 -> movement smoke test

### 3) App Store Upload Guard
- `scripts/upload-to-app-store.sh` now validates the exported IPA bundle points to production Supabase before upload.
- Upload is blocked if the IPA contains wrong project refs.

### 4) Live Production Smoke Gate (`npm run qa:live`)
- Probes the real production Supabase auth endpoint and anon leaderboard query via `scripts/check-online-services.mjs` only when online services are enabled
- Runs Playwright against `https://www.microbizdash.com`
- Fails if the deployed site does not reach the main menu cleanly

## Recommended Game Test Pyramid

### 1) Deterministic gameplay tests
- Keep level generation deterministic and test geometry invariants like safe spawn points, reachable starts, and collectible/enemy placement rules.
- Extract or preserve pure helpers for collision, spawn selection, and level progression so regressions are caught without needing manual play sessions.
- Add tests for transitions that have broken before: guest level 1 -> auth -> level 2, life loss -> restart, save/resume, and victory flow.

### 2) UI/component tests
- Keep `vitest` + Testing Library for guest progression, menu overlays, HUD state, and control handoff between screens.
- Mock the canvas when the test only needs to validate state transitions or input wiring.

### 3) Browser smoke tests
- Use Playwright for high-value happy paths in the real browser shell.
- Required browser smoke coverage now includes:
  - normal app boot without global E2E bypass
  - guest level 1 -> level 2 transition with movement still working
- The risky transition still uses the app's `?e2e` harness, but the suite no longer starts the entire app in global E2E mode.
- With online services disabled by default, startup should render the menu immediately and never depend on backend availability.
- Treat this as a fast regression net for gameplay flows in the web runtime, not as the only protection for the native iPhone build.

### 3b) Live production smoke
- Deterministic local gates are necessary but not sufficient.
- The previous process missed real bugs because local CI did not check the deployed site and was too coupled to backend assumptions.
- `qa:live` now always checks the production URL and only checks backend services when the feature flag says players should be using them.

### 4) Native iPhone smoke tests
- Use the packaged simulator smoke test (`npm run test:ios:smoke`) as the required native gate before release.
- The app now has a native smoke harness (`VITE_E2E_MODE=1 VITE_E2E_NATIVE_SMOKE=1`) that self-runs the highest-risk flow inside the Capacitor shell and writes a machine-readable pass/fail result back to iOS preferences.
- Keep the scope intentionally small and deterministic: app launch, guest progression into level 2, and movement after progression.
- Keep `npm run test:ios:maestro` as an optional exploratory layer if you want visual touch-script coverage on a compatible local setup, but do not rely on it as the only native protection.

### 5) Manual release checklist
- Require one short human playthrough on a physical iPhone before App Store submission.
- Use a fixed script so every release checks the same high-risk moments instead of ad hoc exploration.
- Capture a screen recording for each release candidate so failures are easy to compare and debug.

## CI Workflows

### `quality-gate.yml`
- Runs on every PR and push to `main`
- Installs Chromium
- Executes `npm run qa:standard`

### `ios-smoke-gate.yml`
- Runs on push to `main` (for iOS-relevant files) and manually via workflow dispatch
- Installs Chromium
- Executes `npm run qa:release`

### `production-smoke.yml`
- Runs on a 6-hour schedule and via workflow dispatch
- Executes `npm run qa:live`
- Acts as a deployed-site canary for the public web game

## Local Commands

```bash
# Fast gate for web
npm run qa:web

# Browser smoke test (requires Playwright browser install once)
npm run test:e2e:install
npm run test:e2e

# Standard required merge gate
npm run qa:standard

# Full gate including iOS sync validation
npm run qa:ios

# Standard required release gate
npm run qa:release

# Live deployed-site smoke gate
npm run qa:live

# Build an iOS smoke-test bundle with the E2E harness
npm run ios:sync:e2e

# Build, install, launch, and verify the packaged iOS smoke flow
npm run test:ios:smoke

# Optional Maestro flow for extra local touch automation
npm run test:ios:maestro
```

## Required Manual Setup (One-Time)

1. Enable branch protection in GitHub:
- Require passing checks for:
  - `Quality Gate / qa-web`
  - `iOS Smoke Gate / qa-ios`
- Block direct pushes to `main` without passing checks.

2. Ensure repository has enough GitHub Actions minutes for macOS jobs.

3. Keep the scheduled `production-smoke.yml` workflow enabled so live web regressions surface automatically.

4. (Optional but recommended) Configure crash monitoring (for example Sentry) so production runtime failures are alerted automatically.

## Current Limitations

1. `qa:standard` and `qa:release` are intentionally deterministic; `qa:live` is the separate gate that depends on real production services.
2. Apple App Review/compliance questions still require human response.
3. Code signing and upload to App Store Connect still require Apple credentials and signing assets to be configured in CI before full zero-touch releases.
4. Browser automation is valuable for gameplay regressions, but it does not replace native iOS smoke coverage for lifecycle and WebView-specific behavior.
5. The native smoke suite is intentionally narrow; keep one short manual physical-device pass before App Store submission for feel, audio, and real touch ergonomics.
