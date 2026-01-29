# Build iOS

Build and prepare the iOS app for testing or App Store submission.

## Usage

When asked to build for iOS:
1. Sync Capacitor: `npm run build && npx cap sync ios`
2. Open Xcode: `npx cap open ios`
3. Check for any build errors
4. Verify signing configuration
5. Test on simulator or device

## Steps

1. Build web assets: `npm run build`
2. Sync to iOS: `npx cap sync ios`
3. Open in Xcode: `npx cap open ios`
4. Build in Xcode (Cmd+B)
5. Run on simulator or device

## Common Issues

- Pod dependencies need updating: `cd ios/App && pod install`
- Signing errors: Check certificates in Xcode
- Build errors: Check TypeScript compilation first
