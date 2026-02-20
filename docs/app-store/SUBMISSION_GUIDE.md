# App Store Submission Guide

This guide covers the process of submitting Micro-Biz Dash to the App Store.

## Current Status

**App Status:** ✅ **Submitted for Review** (January 22, 2026)

The app has been successfully submitted to Apple for review. Apple typically reviews apps within 24-48 hours.

## App Store Connect Information

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6758055529/distribution/ios/version/inflight
- **App ID:** 6758055529
- **Bundle ID:** com.microbizdash.game
- **Support URL:** https://www.microbizdash.com

## Developer Account

- **Email:** ventures.prentice@gmail.com
- **Team ID:** `JWMK399CXD` ⬅️ **ALWAYS USE THIS**
- **Team Name:** teera price
- **Team Type:** Individual (Developer Account)

**⚠️ DO NOT USE:** Personal account Team ID `X88G8434MK`

See `docs/reference/DEVELOPER_ACCOUNT_INFO.md` for complete details.

## Code Signing Configuration

### Release Builds (App Store)
- **Style:** Manual
- **Identity:** Apple Distribution
- **Profile:** Micro-Biz Dash Distribution
- **Team:** JWMK399CXD

### Debug Builds
- **Style:** Automatic
- Uses Development profiles

See `docs/reference/SIGNING_EXPLANATION.md` for why manual signing is used for Release.

## Device Support

- **Target:** iPhone only (`TARGETED_DEVICE_FAMILY = "1"`)
- **Orientation:** Portrait only

## Building and Uploading

### Step 1: Preflight (Required)

1. Switch to production Supabase config:
   ```bash
   ./scripts/switch-env.sh prod
   ```
2. Run:
   ```bash
   npm run qa:ios
   ```
   This runs typecheck + tests + build + iOS sync + bundle-target verification.
3. Verify the synced bundle targets production project ref:
   ```bash
   rg -o "vgkpbslbfvcwvlmwkowj|zbtbtmybzuutxfntdyvp" ios/App/App/public/assets/index-*.js | sort -u
   ```
   Expected output for release: `zbtbtmybzuutxfntdyvp` only.

### Step 2: Build and Archive

1. Open Xcode: `ios/App/App.xcworkspace`
2. Select "Any iOS Device" (not simulator)
3. Product → Archive
4. Wait for archive to complete (2-5 minutes)

### Step 3: Upload to App Store Connect

1. In Organizer, select your archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Follow the wizard:
   - Upload
   - Select your team (JWMK399CXD)
   - Click "Upload"
5. Wait 5-10 minutes for upload

If uploading by script (`./scripts/upload-to-app-store.sh`), it now blocks upload when the IPA does not contain the expected production Supabase project ref.

### Step 4: Select Build in App Store Connect

1. Go to App Store Connect → Your App → Version → Build section
2. Click "+" or "Select a build"
3. Choose the build you just uploaded
4. Wait for processing to complete

### Step 5: Submit for Review

1. Review all sections are complete:
   - ✅ Screenshots uploaded
   - ✅ Description filled
   - ✅ Build selected
   - ✅ Contact info filled
   - ✅ Sign-in unchecked (app doesn't require sign-in)
2. Click "Add for Review" button
3. Answer export compliance questions (usually "No" for games)
4. Submit!

## App Store Assets

### Screenshots
- **Location:** `app-store-assets/screenshots/`
- **Status:** ✅ Uploaded to App Store Connect
- **Format:** PNG, RGB (no alpha channel)
- **Dimensions:** 1320 × 2868 pixels (iPhone 6.9" Display)

### App Information
- **Subtitle:** "Survive the 2026 economy!"
- **Primary Category:** Games → Action
- **Subcategory:** Games → Arcade
- **Description:** Completed (3,251 characters)
- **Keywords:** retro,pixel,platformer,arcade,action,2d,sidescroller,8bit,16bit,handheld,90s,indie
- **Support URL:** https://www.microbizdash.com
- **Privacy Policy URL:** https://www.microbizdash.com/privacy

## Important File Locations

### Project Files
- **Workspace:** `ios/App/App.xcworkspace` ← **Open this in Xcode**
- **Project:** `ios/App/App.xcodeproj`
- **Info.plist:** `ios/App/App/Info.plist`

### Provisioning Profile
- **Location:** `~/Library/MobileDevice/Provisioning Profiles/MicroBiz_Dash_Distribution.mobileprovision`
- **Name:** "Micro-Biz Dash Distribution"
- **Type:** App Store (Distribution)

### Archive & IPA
- **Archive:** `ios/App/build/App.xcarchive`
- **IPA:** `ios/App/build/export/App.ipa`
- **ExportOptions:** `ios/App/ExportOptions.plist`

## Common Issues

### Bundle ID Registration

If you need to register the bundle ID in Apple Developer Portal:
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click "+" → Select "App IDs" → "App"
3. Enter Bundle ID: `com.microbizdash.game`
4. Register

### Provisioning Profile

If you need to create an App Store provisioning profile:
1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click "+" → Select "App Store" (Distribution)
3. Select your App ID and certificate
4. Download and install the profile

### Distribution Certificate

If you need to create an Apple Distribution certificate:
1. Xcode → Settings → Accounts
2. Select your developer account
3. Click "Manage Certificates..."
4. Click "+" → Select "Apple Distribution"
5. Xcode will create and install it automatically

## Next Steps After Approval

Once Apple approves your app:
- ✅ App will automatically release (if "Automatically release" is selected)
- ✅ You'll receive an email notification
- ✅ App will be available on the App Store

## Resources

- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
