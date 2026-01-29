# Developer Account Information
**CRITICAL - DO NOT USE PERSONAL ACCOUNT INFO**

> **Note:** This is a project-specific copy. The master reference is stored at:
> `~/Documents/Apple-Developer-Info/DEVELOPER_ACCOUNT.md`
> 
> For new projects, copy that master file to ensure consistency.

## Developer Account (CORRECT - USE THIS)
- **Email:** ventures.prentice@gmail.com
- **Team Name:** teera price
- **Team ID:** `JWMK399CXD` ⬅️ **USE THIS ONE**
- **Team Type:** Individual (Developer Account)
- **Status:** Active Apple Developer Program member ($99/year)

## Personal Account (WRONG - DO NOT USE)
- **Email:** teeraprice@hotmail.com
- **Team Name:** teera price (Personal Team)
- **Team ID:** `X88G8434MK` ⬅️ **DO NOT USE THIS**
- **Team Type:** Personal Team (Free)

---

## Bundle ID Information
- **Bundle ID:** com.microbizdash.game
- **App Store Connect App ID:** 6758055529
- **Registered with:** Developer Account (ventures.prentice@gmail.com)
- **Team ID for Bundle ID:** `JWMK399CXD`

---

## Xcode Project Configuration
The project file (`ios/App/App.xcodeproj/project.pbxproj`) should have:
```
DEVELOPMENT_TEAM = JWMK399CXD;
```

**NEVER use:** `X88G8434MK` (this is the personal account)

---

## How to Verify
1. Check Xcode → Settings → Accounts
2. Developer account: `ventures.prentice@gmail.com` → Team ID: `JWMK399CXD`
3. Personal account: `teeraprice@hotmail.com` → Team ID: `X88G8434MK` (ignore this)

---

## Important Notes
- The bundle ID `com.microbizdash.game` is registered in App Store Connect with the developer account
- All builds, archives, and App Store submissions MUST use Team ID: `JWMK399CXD`
- Using the wrong Team ID will cause "bundle ID cannot be registered" errors

---

**Last Updated:** January 21, 2026
**Verified:** Team ID found in Xcode preferences: `IDEProvisioningTeamByIdentifier`
