# Standard Testing Procedure

This is the default testing routine for Micro-Biz Dash. The goal is simple: no gameplay or release change ships without automated coverage running first.

## Default Rule

- For every meaningful code change, run `npm run qa:standard` before merging.
- For every iPhone release candidate, native gameplay/control change, Capacitor update, or iOS-specific bug fix, run `npm run qa:release` before submitting or shipping.

If a change touches gameplay, auth flow, level progression, controls, save/resume, or native iOS packaging, treat it as release-risky and run the release gate.

## Canonical Commands

### 1) Standard PR Gate

```bash
npm run qa:standard
```

This runs:
- TypeScript checks
- Unit/component tests
- Production build validation
- Supabase target verification in the built web bundle
- Playwright browser smoke tests
  - normal app boot without E2E bypass
  - guest level 1 -> auth -> level 2 gameplay smoke via `?e2e`

Use this for normal day-to-day development and before merging pull requests.

### 2) Release Gate

```bash
npm run qa:release
```

This runs everything in the standard gate, plus:
- iOS bundle sync validation
- iPhone simulator boot/build/install
- Packaged native smoke flow for:
  - app launch
  - guest continuation
  - auth transition to level 2
  - movement still working in level 2

Use this before:
- TestFlight uploads
- App Store submissions
- Releasing a new iPhone build
- Merging risky gameplay or native changes into `main`

## Required Testing Policy

- `qa:standard` is the minimum bar for merge-ready work.
- `qa:release` is the minimum bar for iOS release-ready work.
- If `qa:release` fails, do not submit the app.
- If a bug reaches players that should have been caught by the current gates, add a new automated regression test before the next release.
- Required smoke tests must always include at least one normal startup path without global E2E bypasses.
- E2E harnesses are allowed for specific risky flows, but they cannot be the only required browser coverage.

## Manual Release Check

Automation is the default, not the only step. Before App Store submission, do one short physical-device pass for:
- audio behavior
- touch feel
- background/foreground behavior
- visual polish issues that automation will not judge well

Use [QA Automation](QA_AUTOMATION.md) and [Testing on Physical Device](reference/TEST_ON_PHYSICAL_DEVICE.md) alongside this procedure.
