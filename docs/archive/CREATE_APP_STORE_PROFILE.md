# Create App Store Provisioning Profile

The bundle ID is registered, but Xcode needs an **App Store Provisioning Profile** to archive. Let's create it manually:

## Steps:

1. **Go to:** https://developer.apple.com/account/resources/profiles/list

2. **Click the "+" button** (top left) to create a new profile

3. **Select "App Store"** under "Distribution" → Click "Continue"

4. **Select "App"** → Click "Continue"

5. **Select your App ID:**
   - Choose **"Micro-Biz Dash"** (com.microbizdash.game)
   - Click "Continue"

6. **Select your certificate:**
   - It should show "Apple Distribution" certificate
   - If you don't have one, you'll need to create it first (Xcode can do this automatically)
   - Click "Continue"

7. **Name the profile:**
   - Name: `Micro-Biz Dash App Store` (or any name)
   - Click "Generate"

8. **Download the profile** (it will download automatically)

9. **Double-click the downloaded .mobileprovision file** to install it in Xcode

10. **Go back to Xcode and try Product → Archive again**

---

**Alternative:** If you don't have an "Apple Distribution" certificate, Xcode can create one automatically when you try to archive, but you may need to go to Xcode → Settings → Accounts → Manage Certificates first.
