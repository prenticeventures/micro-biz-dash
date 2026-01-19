# Testing on Physical iPhone/iPad
## Step-by-Step Guide

---

## 📱 Prerequisites

- ✅ iPhone or iPad
- ✅ USB cable (Lightning or USB-C)
- ✅ Apple Developer Account (you have this!)
- ✅ Xcode project open

---

## 🔌 Step 1: Connect Your Device

1. **Connect your iPhone/iPad** to your Mac using the USB cable
2. **Unlock your device** (enter passcode if prompted)
3. **Trust this computer** - Your device will show a popup asking "Trust This Computer?"
   - Tap **"Trust"**
   - Enter your device passcode if asked

---

## 🔐 Step 2: Configure Signing in Xcode

1. **In Xcode**, click on the **project name** in the left sidebar (the blue icon at the very top)
2. **Select the "App" target** (under "TARGETS" in the main area)
3. **Click the "Signing & Capabilities" tab** (at the top of the main area)
4. **Check the box** that says **"Automatically manage signing"**
5. **Select your Team:**
   - Click the **"Team" dropdown**
   - Choose your Apple Developer account (the email you used to sign up)
   - If you don't see your account:
     - Click **"Add Account..."**
     - Sign in with your Apple ID
     - Accept any terms if prompted
     - Then select your team from the dropdown

6. **Xcode will automatically:**
   - Create a provisioning profile
   - Configure signing certificates
   - You might see a yellow warning - that's normal, Xcode is setting things up

---

## 📲 Step 3: Select Your Device

1. **At the top toolbar** in Xcode, click the **device dropdown** (next to the Play button)
2. **Look for your device** - it should appear under "iOS Device" or with your device name
   - Example: "Teera's iPhone" or "iPhone 15 Pro"
3. **Select your device**

**Note:** If your device doesn't appear:
- Make sure it's unlocked
- Make sure you tapped "Trust" on the device
- Try unplugging and replugging the cable
- Check that the cable is working (try charging your device)

---

## 🚀 Step 4: Build and Run

1. **Click the Play button** (▶️) or press `Cmd + R`
2. **First time only:** Your device will show a popup saying the app is "Untrusted Developer"
   - Go to: **Settings → General → VPN & Device Management** (or **Device Management**)
   - Tap on your Apple ID/Developer account
   - Tap **"Trust [Your Name]"**
   - Tap **"Trust"** in the confirmation popup
3. **The app will build** (takes 1-2 minutes first time)
4. **The app will install** on your device
5. **The app will launch** automatically!

---

## 🎮 Step 5: Test Your Game

Now you can test with **real touch controls**:
- **Left thumb** on D-pad (left side)
- **Right thumb** on A button (right side)
- **Test all 5 levels**
- **Test victory celebration**
- **Test audio** (make sure device isn't muted)

---

## 🐛 Troubleshooting

### "No signing certificate found"
**Fix:**
- Make sure "Automatically manage signing" is checked
- Select your Team from the dropdown
- If still errors, try: Product → Clean Build Folder (Shift+Cmd+K), then rebuild

### "Device not found"
**Fix:**
- Unlock your device
- Make sure you tapped "Trust This Computer"
- Try a different USB port
- Try a different cable
- Restart Xcode

### "Untrusted Developer" (after app installs)
**Fix:**
- Settings → General → VPN & Device Management
- Tap your developer account
- Tap "Trust"
- Launch the app again

### "Could not launch app"
**Fix:**
- Make sure device is unlocked
- Make sure you trusted the developer (see above)
- Try deleting the app from device and rebuilding

### Build errors
**Fix:**
- Make sure you're on the `ios-app` branch
- Try: `npm run ios:sync` to rebuild and sync
- Try: Product → Clean Build Folder, then rebuild

---

## 💡 Tips

- **Keep device connected** while testing (faster rebuilds)
- **Device must be unlocked** for Xcode to install apps
- **First build takes longer** - be patient!
- **Subsequent builds are faster** once everything is set up

---

## ✅ Success Checklist

- [ ] Device connected and trusted
- [ ] Signing configured in Xcode
- [ ] Device selected in Xcode
- [ ] App builds successfully
- [ ] App installs on device
- [ ] App launches
- [ ] Touch controls work
- [ ] Game plays correctly

---

**Ready?** Connect your device and follow the steps above! 🚀
