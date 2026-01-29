# Create Apple Distribution Certificate

**Root Cause Found:** You don't have an "Apple Distribution" certificate, which is required for App Store builds.

## Quick Fix in Xcode:

1. **Xcode → Settings** (Cmd + ,)
2. **Accounts** tab
3. Click on **`ventures.prentice@gmail.com`** (your developer account)
4. Click **"Manage Certificates..."** button
5. Click the **"+"** button (bottom left)
6. Select **"Apple Distribution"**
7. Xcode will create and install it automatically
8. Click **"Done"**

## Then:

1. Go back to Xcode
2. Try **Product → Archive** again

Xcode should now be able to create the App Store provisioning profile automatically.

---

**Why this is needed:** App Store distribution requires an "Apple Distribution" certificate (different from "Apple Development" certificate). Without it, Xcode can't create App Store provisioning profiles.
