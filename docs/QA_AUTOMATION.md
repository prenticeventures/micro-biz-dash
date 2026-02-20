# QA Automation Guide

This project now uses automated quality gates to prevent broken builds from shipping.

## What Is Automated

### 1) Web Quality Gate (`npm run qa:web`)
- TypeScript typecheck (`npm run typecheck`)
- Unit/component tests (`npm run test:ci`)
- Production build (`npm run build`)
- Supabase target verification in built bundle (`dist/assets/index-*.js`)

### 2) iOS Quality Gate (`npm run qa:ios`)
- Runs all web quality gate checks above
- Syncs web bundle into iOS (`npm run ios:sync`)
- Verifies synced iOS bundle points to expected Supabase project ref

### 3) App Store Upload Guard
- `scripts/upload-to-app-store.sh` now validates the exported IPA bundle points to production Supabase before upload.
- Upload is blocked if the IPA contains wrong project refs.

## CI Workflows

### `quality-gate.yml`
- Runs on every PR and push to `main`
- Executes `npm run qa:web`

### `ios-smoke-gate.yml`
- Runs on push to `main` (for iOS-relevant files) and manually via workflow dispatch
- Executes `npm run qa:ios`
- Builds iOS simulator target with `xcodebuild` to catch native build regressions

## Local Commands

```bash
# Fast gate for web
npm run qa:web

# Full gate including iOS sync validation
npm run qa:ios
```

## Required Manual Setup (One-Time)

1. Enable branch protection in GitHub:
- Require passing checks for:
  - `Quality Gate / qa-web`
  - `iOS Smoke Gate / qa-ios`
- Block direct pushes to `main` without passing checks.

2. Ensure repository has enough GitHub Actions minutes for macOS jobs.

3. (Optional but recommended) Configure crash monitoring (for example Sentry) so production runtime failures are alerted automatically.

## Current Limitations

1. Tests are deterministic and mock backend behavior; they do not depend on live Supabase uptime.
2. Apple App Review/compliance questions still require human response.
3. Code signing and upload to App Store Connect still require Apple credentials and signing assets to be configured in CI before full zero-touch releases.
