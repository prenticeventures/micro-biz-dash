# iOS Setup - Manual Steps Required

## ✅ What's Been Done Automatically

- ✅ Capacitor installed and configured
- ✅ iOS project created in `ios/` folder
- ✅ Build scripts added to package.json
- ✅ App configured with:
  - Name: "Micro-Biz Dash"
  - Bundle ID: `com.microbizdash.app`
  - Web directory: `dist`

---

## 📋 Manual Steps You Need to Complete

### Step 1: Install CocoaPods (Required)

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

---

### Step 2: Create App Icon

You need a 1024x1024 PNG icon. Your favicon.svg is ready to convert.

**Easiest method - Online converter:**
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `public/favicon.svg`
3. Set output size: **1024x1024**
4. Download the PNG
5. Save it as: `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png`

**Or use ImageMagick (if you have it):**
```bash
convert -background none -size 1024x1024 public/favicon.svg ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png
```

**Note:** Xcode can auto-generate smaller icon sizes from the 1024x1024 version when you open the project.

---

### Step 3: Fix Xcode Plugin Issue (If Needed)

If you see plugin errors, run:

```bash
xcodebuild -runFirstLaunch
```

This updates Xcode's system content.

---

### Step 4: Open in Xcode

Once CocoaPods is installed, open the project:

```bash
npm run ios:open
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

**Important:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

---

### Step 5: Configure App Icon in Xcode

1. In Xcode, select the project (top of left sidebar)
2. Select the "App" target
3. Go to "General" tab
4. Under "App Icons and Launch Screen"
5. Drag your 1024x1024 icon into the AppIcon slot
6. Xcode will auto-generate all required sizes

---

### Step 6: Test in Simulator

1. In Xcode, select a simulator (e.g., "iPhone 15 Pro")
2. Click the Play button (▶️) or press `Cmd + R`
3. The app should build and launch in the simulator

---

### Step 7: Configure Signing (For Device Testing)

1. In Xcode, select the project
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Apple Developer Team (you'll need your Apple Developer account)

---

## 🚀 Quick Commands Reference

```bash
# Build web app and sync to iOS
npm run ios:sync

# Open in Xcode
npm run ios:open

# Build, sync, and open (all in one)
npm run ios:run
```

---

## 🐛 Troubleshooting

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

---

## 📱 Next Steps After Testing

Once the app works in simulator:

1. **Test on physical device** (optional but recommended)
2. **Create App Store assets** (screenshots, description)
3. **Build for App Store** (Archive in Xcode)
4. **Submit to App Store Connect**

---

## 💡 Tips

- Always use `npm run ios:sync` after making web code changes
- The iOS project is in `ios/` - don't edit it manually unless necessary
- Your web code changes go in the root directory (App.tsx, components/, etc.)
- After web changes: `npm run build` then `npm run ios:sync`

---

**Ready to continue?** Start with Step 1 (CocoaPods installation) and let me know when you're ready for the next steps!
