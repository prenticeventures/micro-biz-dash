# Why Manual Signing for Release/App Store

## The Issue

Xcode's automatic signing has a limitation: when archiving for App Store distribution, it sometimes tries to create/use Development provisioning profiles first, even when App Store profiles exist. This causes failures when:
- No devices are registered in the Developer Portal
- Xcode can't communicate with Apple's servers to create Development profiles

## The Solution

For **App Store distribution** (Release builds when archiving), manual signing is actually the **correct and recommended approach** because:

1. **Reliability**: Ensures the correct App Store provisioning profile is used
2. **Predictability**: No ambiguity about which profile/certificate is used
3. **Industry Standard**: Many production apps use manual signing for Release builds

## Current Configuration

- **Debug builds**: Automatic signing (uses Development profiles) ✅
- **Release builds**: Manual signing (uses App Store profile) ✅

This is a **proper configuration**, not a workaround. The manual signing settings ensure:
- Correct Team ID: `JWMK399CXD` (developer account)
- Correct Certificate: `Apple Distribution`
- Correct Profile: `Micro-Biz Dash Distribution` (App Store profile)

## Why This Works

With manual signing for Release:
- Xcode uses the explicitly specified App Store provisioning profile
- No ambiguity or fallback to Development profiles
- Reliable App Store builds every time

This is the standard approach for App Store distribution.
