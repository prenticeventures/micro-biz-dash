#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios/App"
DERIVED_DATA_PATH="$IOS_DIR/build-e2e"
APP_PATH="$DERIVED_DATA_PATH/Build/Products/Debug-iphonesimulator/App.app"
BUNDLE_ID="${IOS_SMOKE_BUNDLE_ID:-com.microbizdash.game}"
RESULT_TIMEOUT_SECONDS="${IOS_SMOKE_TIMEOUT_SECONDS:-45}"
XCODEBUILD_LOG="${TMPDIR:-/tmp}/microbiz-ios-smoke-xcodebuild.log"

find_device_id() {
  if [[ -n "${IOS_SMOKE_DEVICE_ID:-}" ]]; then
    echo "$IOS_SMOKE_DEVICE_ID"
    return
  fi

  local booted_device
  booted_device="$(xcrun simctl list devices booted | awk -F '[()]' '/iPhone/ { print $2; exit }')"
  if [[ -n "$booted_device" ]]; then
    echo "$booted_device"
    return
  fi

  xcrun simctl list devices available | awk -F '[()]' '/iPhone/ && $0 !~ /unavailable/ { print $2; exit }'
}

read_smoke_result() {
  local plist_path="$1"

  node - "$plist_path" <<'NODE'
const fs = require('fs');
const { execFileSync } = require('child_process');

const plistPath = process.argv[2];
if (!fs.existsSync(plistPath)) {
  process.exit(2);
}

const raw = execFileSync('plutil', ['-convert', 'json', '-o', '-', plistPath], {
  encoding: 'utf8',
});
const data = JSON.parse(raw);
const value = data['CapacitorStorage.nativeSmokeResult'];

if (!value) {
  process.exit(3);
}

process.stdout.write(value);
NODE
}

DEVICE_ID="$(find_device_id)"

if [[ -z "$DEVICE_ID" ]]; then
  echo "No iPhone simulator is available for the iOS smoke test."
  exit 1
fi

echo "Using simulator: $DEVICE_ID"
xcrun simctl boot "$DEVICE_ID" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$DEVICE_ID" -b

cd "$ROOT_DIR"

echo "Syncing iOS app with native smoke harness enabled..."
VITE_E2E_MODE=1 VITE_E2E_NATIVE_SMOKE=1 npm run ios:sync

echo "Removing stale extended attributes from iOS build inputs..."
xattr -cr "$IOS_DIR" "$ROOT_DIR/node_modules/@capacitor/ios"

echo "Building simulator app..."
cd "$IOS_DIR"
if ! xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -destination "id=$DEVICE_ID" \
  -derivedDataPath ./build-e2e \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build >"$XCODEBUILD_LOG" 2>&1; then
  echo "xcodebuild failed. Tail of build log:"
  tail -n 200 "$XCODEBUILD_LOG"
  exit 1
fi

echo "Installing fresh simulator build..."
xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl uninstall "$DEVICE_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl install "$DEVICE_ID" "$APP_PATH"

echo "Launching app..."
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID" >/dev/null

CONTAINER_PATH="$(xcrun simctl get_app_container "$DEVICE_ID" "$BUNDLE_ID" data)"
PREFERENCES_PATH="$CONTAINER_PATH/Library/Preferences/$BUNDLE_ID.plist"

echo "Waiting for native smoke result..."
for ((elapsed = 0; elapsed < RESULT_TIMEOUT_SECONDS; elapsed++)); do
  RESULT_JSON="$(read_smoke_result "$PREFERENCES_PATH" 2>/dev/null || true)"

  if [[ -n "$RESULT_JSON" ]]; then
    STATUS="$(printf '%s' "$RESULT_JSON" | node -e 'const fs = require("fs"); const data = JSON.parse(fs.readFileSync(0, "utf8")); process.stdout.write(data.status || "");')"

    if [[ "$STATUS" == "PASS" ]]; then
      echo "Native smoke test passed."
      printf '%s\n' "$RESULT_JSON"
      exit 0
    fi

    if [[ "$STATUS" == "FAIL" ]]; then
      echo "Native smoke test failed."
      printf '%s\n' "$RESULT_JSON"
      exit 1
    fi
  fi

  sleep 1
done

echo "Timed out waiting for native smoke result."
if [[ -f "$PREFERENCES_PATH" ]]; then
  echo "Current preferences payload:"
  plutil -convert json -o - "$PREFERENCES_PATH"
fi

exit 1
