# Xcode First Build Checklist
## After Xcode Update Completes

---

## ✅ Step-by-Step Guide

### 1. **Open the Project** (if not already open)
```bash
npm run ios:open
```
Or manually: `open ios/App/App.xcworkspace`

**Important:** Always open the `.xcworkspace` file, NOT `.xcodeproj`!

---

### 2. **Wait for Xcode to Index**
- Xcode will analyze the project (may take 1-2 minutes)
- Look for "Indexing..." in the status bar
- Wait until it says "Ready" or shows no status

---

### 3. **Select a Simulator**
- Click the device selector dropdown (next to the Play button at the top)
- Choose an iPhone simulator (e.g., "iPhone 15 Pro" or "iPhone 15")
- If you see "No simulators available", you may need to download one:
  - Go to: **Xcode → Settings → Platforms** (or **Components**)
  - Download an iOS Simulator runtime (iOS 17.x or 18.x recommended)

---

### 4. **Configure Signing** (if prompted)
If you see a signing error:
- Click on the project name in the left sidebar (top item)
- Select the "App" target
- Go to "Signing & Capabilities" tab
- Check "Automatically manage signing"
- Select your Apple Developer Team (or "Add Account" if you haven't added it yet)

**Note:** For simulator testing, you can use "Personal Team" even without a paid Apple Developer account.

---

### 5. **Build and Run**
- Click the **Play button** (▶️) or press `Cmd + R`
- First build takes 1-3 minutes
- Watch the build progress in the top status bar

---

### 6. **What to Expect**
- ✅ **Success:** Simulator opens and your game launches!
- ⚠️ **Warnings:** Usually safe to ignore (yellow triangles)
- ❌ **Errors:** Red X's - these need to be fixed

---

## 🐛 Common Issues & Fixes

### "No signing certificate found"
**Fix:** 
- Go to Signing & Capabilities tab
- Check "Automatically manage signing"
- Select "Personal Team" (works for simulator)

### "Build failed" with Swift errors
**Fix:**
- Try: `npm run ios:sync` to rebuild and sync
- Or: Product → Clean Build Folder (Shift+Cmd+K), then rebuild

### "Simulator not available"
**Fix:**
- Xcode → Settings → Platforms
- Download iOS Simulator runtime
- Wait for download, then try again

### "Pod install needed"
**Fix:**
```bash
npm run ios:pods
```

---

## 🎮 After Successful Build

Once the app launches in simulator:

1. **Test touch controls** - Your mobile controls should work!
2. **Play through the game** - Test all 5 levels
3. **Test victory celebration** - Complete the game to see the celebration
4. **Check audio** - Make sure sounds work
5. **Test performance** - Should run smoothly

---

## 📝 Quick Commands

```bash
# Rebuild and sync (if you change web code)
npm run ios:sync

# Reinstall pods (if dependencies break)
npm run ios:pods

# Open in Xcode
npm run ios:open
```

---

## 🎯 Next Steps After Testing

Once everything works in simulator:

1. **Test on physical device** (optional)
2. **Prepare App Store assets** (screenshots, description)
3. **Build for App Store** (Archive in Xcode)
4. **Submit to App Store Connect**

---

**Ready?** Once Xcode finishes updating, follow steps 1-5 above! 🚀
