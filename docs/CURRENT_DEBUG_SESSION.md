# Current Project Handoff

**Date:** 2026-03-12
**Last Updated:** 2026-03-12
**Status:** Waiting on Apple App Review for version `1.0.4 (5)`

## What Was Completed Today

### Level 2 Control Bug Fixed
- Fixed the bug where a player could complete level 1, authenticate successfully, enter level 2, and then lose horizontal movement.
- Root cause: level 2 could generate an opening floating platform that overlapped the old hardcoded spawn position, causing immediate collision and effectively cancelling movement.
- Fix: moved spawn handling into level generation so each level provides a safe `spawnPoint`, and `GameCanvas` now uses that generated spawn.

### Regression Coverage Added
- Added deterministic gameplay geometry coverage for safe spawns and the level 2 overlap regression.
- Added app-flow coverage for guest level 1 -> login -> level 2 -> touch controls still functioning.
- Added Playwright browser smoke coverage for the same risky transition.
- Added a packaged native iOS simulator smoke gate that boots the Capacitor app, runs the risky path inside the app, and verifies movement still works in level 2.

### Web Boot Hang Fixed
- Found a second release-blocking issue on the web app: in some client states the app could remain stuck on the black `Loading...` screen.
- Root cause was deeper than a missing timeout:
  - the app boot path treated remote auth validation as a first-paint dependency
  - `getCurrentUser()` called `supabase.auth.getUser()`, which can require a remote auth round-trip
  - `AuthScreen` also redundantly checked auth again on mount
  - several services repeatedly called `supabase.auth.getUser()` even when a cached session was already available locally
- Fix:
  - switched startup to restore the local session first and hydrate profile/saved-game data in the background
  - removed the redundant auth bootstrap inside `AuthScreen`
  - replaced repeated `auth.getUser()` lookups in services with session-backed lookups
  - kept a non-blocking degraded-mode warning if online services are slow
  - added guest continuation when sign-in is temporarily unavailable after level 1
- Added regression coverage for:
  - normal app boot reaching the main menu without global E2E bypass or degraded-service warnings
  - auth bootstrap stall while the menu remains interactive
  - guest level 1 completion continuing to level 2 when sign-in is unavailable
- Strengthened Playwright so the required smoke suite no longer starts the entire app in global E2E mode.
- Added a live production smoke gate (`npm run qa:live`) plus a scheduled GitHub workflow to probe the deployed site and real production backend.

## Release / App Store Status

### Build Submitted
- iOS version bumped to `1.0.4`
- iOS build number bumped to `5`
- Release gate passed before archive/upload
- Signed archive succeeded
- IPA export succeeded: `ios/App/build/export/App.ipa`
- App Store Connect upload succeeded on 2026-03-12
- Delivery UUID: `1d70916e-abab-4702-81fa-8a8d6282d771`
- Build `1.0.4 (5)` was selected and submitted for review

### What’s New Text Used
- `Fixed a bug where movement controls could stop working after completing Level 1 and signing in to continue to Level 2. Improved gameplay stability and added stronger quality checks to help prevent early-game issues from reaching players.`

## Standard Testing Procedure Now In Place

### Default Commands
- `npm run qa:standard`
  - Default merge gate
  - Runs typecheck, unit/component tests, production build validation, Supabase target verification, and Playwright smoke tests
- `npm run qa:release`
  - Default iPhone release gate
  - Runs the full iOS quality gate including the packaged simulator smoke test
- `npm run qa:live`
  - Default live web confidence gate after deploy
  - Probes real production Supabase health and runs Playwright against `https://www.microbizdash.com`

### Policy
- No meaningful gameplay or release change should ship without automated coverage first.
- `qa:standard` is the minimum bar before merge-ready work.
- `qa:release` is the minimum bar before iPhone release-ready work.

## Verification Completed Today

- `npm run test:ci`
- `npm run test:e2e`
- `npm run test:e2e:prod`
- `npm run test:ios:smoke`
- `npm run qa:standard`
- `npm run qa:release`
- `npm run qa:live`

## Git / Repo State

- Main fix/test commit created: `de32581` (`Fix level 2 movement and add release test gates`)
- Branch pushed to GitHub: `codex/level2-release-gates`
- User manually triggered PR merge in GitHub because `main` is protected
- Local GitHub CLI auth is expired, so future PR automation may require `gh auth login`

## Important Files

- `utils/levelGenerator.ts`
- `components/GameCanvas.tsx`
- `App.tsx`
- `utils/levelGenerator.test.ts`
- `App.test.tsx`
- `e2e/level2-smoke.spec.ts`
- `e2e/app-boot.spec.ts`
- `scripts/check-online-services.mjs`
- `scripts/run-ios-smoke.sh`
- `docs/STANDARD_TESTING_PROCEDURE.md`
- `docs/QA_AUTOMATION.md`

## Likely Next Steps Tomorrow

1. Check App Store Connect for review status of `1.0.4 (5)`.
2. Confirm the GitHub PR fully merged and `main` reflects the release changes.
3. Confirm the web deployment has picked up the new session-first auth bootstrap change.
4. If Apple rejects or requests changes, capture the exact rejection text and respond from there.
5. Keep an eye on the scheduled production smoke workflow and any immediate production issues.

## Notes

- Production Supabase config is currently active in `.env.local`.
- The simulator was shut down at the end of the session.
- Maestro remains available as an optional extra local layer, but the reliable native gate is the packaged iOS smoke test.
- In this local Codex environment, direct DNS resolution to the Supabase host failed for Node/curl probes, so `qa:live` could not be fully validated here even though browser smoke against the deployed site passed.
