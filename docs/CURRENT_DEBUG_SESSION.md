# Current Project Handoff

**Date:** 2026-03-12
**Last Updated:** 2026-03-12
**Status:** Guest-only mode is now the default product path; App Store build `1.0.4 (5)` remains under review

## What Was Completed Today

### Online Services Disabled By Default
- Production Supabase is paused on the free plan, which caused the live web app to hang or show auth-recovery warnings for returning players.
- We responded by moving the product back to a guest-only default:
  - sign-in, cloud save, and leaderboards are now behind `VITE_ENABLE_ONLINE_SERVICES=1`
  - when that flag is off, the app does not attempt auth bootstrap, does not show login gates, and does not depend on Supabase to boot or progress
  - auth, game-state, and stats services now short-circuit safely when online services are disabled so accidental future calls do not wake the paused backend path back up
- The guest flow is now the expected happy path, not a degraded fallback.

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
- Root cause:
  - startup treated remote auth validation as a first-paint dependency
  - returning browsers with a cached Supabase session triggered account-restore work against a paused backend
  - several services still assumed auth was available whenever called
- Fix:
  - online services are feature-flagged off by default
  - startup immediately renders the menu in guest mode when online services are off
  - auth/game-state/stats services all guard themselves when the feature is disabled
  - the level 1 -> level 2 path now continues with no auth gate in the default build
- Added regression coverage for:
  - normal app boot reaching the main menu without hanging
  - no degraded-service banners in the default guest-only build
  - guest level 1 -> level 2 progression with movement still working
- Strengthened Playwright so the required smoke suite no longer starts the app in a bypassed mode that misses real startup bugs.
- Kept `qa:live` as the deployed-site smoke gate, but backend probes now only run when online services are intentionally re-enabled.

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
  - Runs typecheck, unit/component tests, production build validation, and Playwright smoke tests
- `npm run qa:release`
  - Default iPhone release gate
  - Runs the full iOS quality gate including the packaged simulator smoke test
- `npm run qa:live`
  - Default live web confidence gate after deploy
  - Runs Playwright against `https://www.microbizdash.com`
  - Probes real backend health only if `VITE_ENABLE_ONLINE_SERVICES=1`

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
2. Confirm the web deployment is serving the guest-only default build with no auth-restore banner on first paint.
3. If online accounts are ever needed again, re-enable them with `VITE_ENABLE_ONLINE_SERVICES=1` and restore Supabase health before exposing that path to players.
4. If Apple rejects or requests changes, capture the exact rejection text and respond from there.
5. Keep an eye on the scheduled production smoke workflow and any immediate production issues.

## Notes

- Supabase is intentionally optional now; the default build should be treated as guest-only unless the online-services flag is explicitly enabled.
- The simulator was shut down at the end of the session.
- Maestro remains available as an optional extra local layer, but the reliable native gate is the packaged iOS smoke test.
- The current testing policy assumes guest-only web/iOS flows are the release-critical path while Supabase stays paused.
