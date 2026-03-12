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
- Most likely cause: the initial auth bootstrap (`getCurrentUser()`) could hang indefinitely, leaving `isCheckingAuth` true forever.
- Fix: added an auth-bootstrap timeout with guest-mode fallback so the app fails open instead of hanging.
- Added regression coverage for:
  - normal app boot reaching the main menu without global E2E bypass
  - auth bootstrap stall falling back to guest mode
- Strengthened Playwright so the required smoke suite no longer starts the entire app in global E2E mode.

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

### Policy
- No meaningful gameplay or release change should ship without automated coverage first.
- `qa:standard` is the minimum bar before merge-ready work.
- `qa:release` is the minimum bar before iPhone release-ready work.

## Verification Completed Today

- `npm run test:ci`
- `npm run test:e2e`
- `npm run test:ios:smoke`
- `npm run qa:standard`
- `npm run qa:release`

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
- `scripts/run-ios-smoke.sh`
- `docs/STANDARD_TESTING_PROCEDURE.md`
- `docs/QA_AUTOMATION.md`

## Likely Next Steps Tomorrow

1. Check App Store Connect for review status of `1.0.4 (5)`.
2. Confirm the GitHub PR fully merged and `main` reflects the release changes.
3. Confirm the web deployment has picked up the auth-bootstrap fallback fix.
4. If Apple rejects or requests changes, capture the exact rejection text and respond from there.
5. If review passes, verify release status and monitor for any immediate production issues.

## Notes

- Production Supabase config is currently active in `.env.local`.
- The simulator was shut down at the end of the session.
- Maestro remains available as an optional extra local layer, but the reliable native gate is the packaged iOS smoke test.
