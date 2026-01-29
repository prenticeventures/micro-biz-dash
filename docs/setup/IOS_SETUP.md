# iOS Setup Guide

This guide covers setting up the iOS app for Micro-Biz Dash using Capacitor.

## Prerequisites

- ✅ Mac computer (iOS development requires macOS)
- ✅ Xcode (free from Mac App Store, ~12GB download)
- ✅ Apple Developer Account ($99/year) - [developer.apple.com](https://developer.apple.com)
- ✅ Node.js (already installed)

## Quick Start

1. **Install CocoaPods** (one-time setup)
2. **Create App Icon** (1024x1024 PNG)
3. **Open in Xcode**
4. **Configure Signing**
5. **Test in Simulator**

## Step 1: Install CocoaPods

CocoaPods manages iOS dependencies. Install it by running in Terminal:

```bash
sudo gem install cocoapods
```

You'll be prompted for your password. This is a one-time setup.

**Then install the iOS dependencies:**

```bash
cd ios/App
pod install
cd ../..
```

## Step 2: Create App Icon

You need a 1024x1024 PNG icon. Your favicon.svg is ready to convert.

**Easiest method - Online converter:**
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `public/favicon.svg`
3. Set output size: **1024x1024**
4. Download the PNG
5. Save it as: `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png`

**Note:** Xcode can auto-generate smaller icon sizes from the 1024x1024 version when you open the project.

## Step 3: Open in Xcode

Once CocoaPods is installed, open the project:

```bash
npm run ios:open
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

**Important:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

## Step 4: Configure App Icon in Xcode

1. In Xcode, select the project (top of left sidebar)
2. Select the "App" target
3. Go to "General" tab
4. Under "App Icons and Launch Screen"
5. Drag your 1024x1024 icon into the AppIcon slot
6. Xcode will auto-generate all required sizes

## Step 5: Configure Signing

1. In Xcode, select the project
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Apple Developer Team

**For simulator testing:** You can use "Personal Team" even without a paid Apple Developer account.

**For device testing:** You'll need a paid Apple Developer account. See `docs/reference/DEVELOPER_ACCOUNT_INFO.md` for details.

## Step 6: Test in Simulator

1. In Xcode, select a simulator (e.g., "iPhone 15 Pro")
2. Click the Play button (▶️) or press `Cmd + R`
3. The app should build and launch in the simulator

## Quick Commands Reference

```bash
# Build web app and sync to iOS
npm run ios:sync

# Open in Xcode
npm run ios:open

# Build, sync, and open (all in one)
npm run ios:run

# Reinstall pods (if dependencies break)
npm run ios:pods
```

## Troubleshooting

### "CocoaPods not found"
- Make sure you ran `sudo gem install cocoapods`
- Try: `gem install cocoapods --user-install` (no sudo needed, but may need to add to PATH)

### "Pod install failed"
- Make sure you're in the `ios/App` directory
- Try: `pod repo update` then `pod install`

### "Xcode plugin errors"
- Run: `xcodebuild -runFirstLaunch`
- Or restart Xcode

### "Build failed"
- Make sure you ran `npm run build` first
- Check that `dist/` folder exists
- Try: `npm run ios:sync` to rebuild and sync

### "No signing certificate found"
- Go to Signing & Capabilities tab
- Check "Automatically manage signing"
- Select your Team from the dropdown

## Testing on Physical Device

For testing on a real iPhone/iPad, see `docs/reference/TEST_ON_PHYSICAL_DEVICE.md`.

## Next Steps After Testing

Once the app works in simulator:

1. **Test on physical device** (optional but recommended)
2. **Prepare App Store assets** (screenshots, description)
3. **Build for App Store** (Archive in Xcode)
4. **Submit to App Store Connect**

## Tips

- Always use `npm run ios:sync` after making web code changes
- The iOS project is in `ios/` - don't edit it manually unless necessary
- Your web code changes go in the root directory (App.tsx, components/, etc.)
- After web changes: `npm run build` then `npm run ios:sync`

## Project Structure

```
micro-biz-dash_-2026-edition/
├── ios/                          # iOS native project
│   └── App/
│       ├── App.xcworkspace       # ← Open this in Xcode!
│       ├── Podfile              # iOS dependencies
│       └── App/
│           └── Assets.xcassets/
│               └── AppIcon.appiconset/
│                   └── icon-1024.png  # Your app icon
├── capacitor.config.ts           # Capacitor config
└── package.json                  # iOS scripts added
```
