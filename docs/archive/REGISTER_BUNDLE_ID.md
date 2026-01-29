# How to Register Bundle ID in Apple Developer Portal

The bundle ID `com.microbizdash.game` is registered in App Store Connect but needs to be registered in the **Apple Developer Portal** for Xcode to create provisioning profiles.

## Steps to Register:

1. **Go to:** https://developer.apple.com/account/resources/identifiers/list

2. **Sign in** with your developer account: `ventures.prentice@gmail.com`

3. **Click the "+" button** (top left) to add a new identifier

4. **Select "App IDs"** → Click "Continue"

5. **Select "App"** → Click "Continue"

6. **Fill out the form:**
   - **Description:** Micro-Biz Dash (or any description)
   - **Bundle ID:** Select "Explicit"
   - **Bundle ID field:** Enter exactly: `com.microbizdash.game`
   - **Capabilities:** Leave default (or enable what you need)
   
7. **Click "Continue"** → **Click "Register"**

8. **Once registered**, go back to Xcode and try **Product → Archive** again

## Alternative: Use Xcode to Register

Sometimes Xcode can register it automatically if you:
1. In Xcode, go to **Xcode → Settings → Accounts**
2. Select your developer account (`ventures.prentice@gmail.com`)
3. Click **"Manage Certificates..."**
4. Then try archiving again - Xcode might prompt to register the bundle ID

---

**Why this is needed:** App Store Connect registration is separate from Developer Portal registration. Xcode needs it registered in the Developer Portal to create provisioning profiles for builds.
