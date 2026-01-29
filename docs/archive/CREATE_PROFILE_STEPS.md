# Create App Store Provisioning Profile - Quick Steps

The certificate is created! Now we need to create the App Store provisioning profile.

## Steps (should take 2 minutes):

1. **The Developer Portal should be open** - you should see "Register a New Provisioning Profile"

2. **Select "App Store"** (under Distribution section) → Click **"Continue"**

3. **Select "App"** → Click **"Continue"**

4. **Select App ID:**
   - Choose **"Micro-Biz Dash"** (com.microbizdash.game)
   - Click **"Continue"**

5. **Select Certificate:**
   - You should see **"Apple Distribution: teera price (JWMK399CXD)"**
   - Check the box next to it
   - Click **"Continue"**

6. **Name the Profile:**
   - Profile Name: `Micro-Biz Dash App Store`
   - Click **"Generate"**

7. **Download the profile** (it downloads automatically)

8. **Double-click the downloaded `.mobileprovision` file** to install it in Xcode

9. **Go back to Xcode and try Product → Archive again**

---

**Why this is needed:** Even with automatic signing, Xcode sometimes needs the App Store profile to exist before it can use it for archiving.
