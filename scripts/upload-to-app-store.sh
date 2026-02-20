#!/bin/bash
# Upload Micro-Biz Dash IPA to App Store Connect
# Requires: APP_SPECIFIC_PASSWORD env var (create at https://appleid.apple.com → Sign-In and Security → App-Specific Passwords)

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
IPA_PATH="$PROJECT_DIR/ios/App/build/export/App.ipa"
APPLE_ID="${APPLE_ID:-ventures.prentice@gmail.com}"
EXPECTED_SUPABASE_PROJECT_REF="${EXPECTED_SUPABASE_PROJECT_REF:-zbtbtmybzuutxfntdyvp}"

if [[ ! -f "$IPA_PATH" ]]; then
  echo "Error: IPA not found at $IPA_PATH. Run archive + export first."
  exit 1
fi

if [[ -z "$APP_SPECIFIC_PASSWORD" ]]; then
  echo "Error: APP_SPECIFIC_PASSWORD is not set."
  echo ""
  echo "1. Go to https://appleid.apple.com"
  echo "2. Sign in with $APPLE_ID"
  echo "3. Sign-In and Security → App-Specific Passwords → Generate"
  echo "4. Run: APP_SPECIFIC_PASSWORD='xxxx-xxxx-xxxx-xxxx' ./scripts/upload-to-app-store.sh"
  exit 1
fi

TMP_IPA_DIR="$(mktemp -d /tmp/microbiz-ipa.XXXXXX)"
cleanup() {
  rm -rf "$TMP_IPA_DIR"
}
trap cleanup EXIT

echo "Validating IPA Supabase target..."
unzip -qq "$IPA_PATH" -d "$TMP_IPA_DIR"

node "$PROJECT_DIR/scripts/verify-supabase-ref.mjs" \
  --dir "$TMP_IPA_DIR/Payload/App.app/public/assets" \
  --expected-ref "$EXPECTED_SUPABASE_PROJECT_REF" \
  --context "exported IPA bundle"

echo "Supabase target check passed ($EXPECTED_SUPABASE_PROJECT_REF)."

echo "Uploading App.ipa to App Store Connect (Apple ID: $APPLE_ID)..."
xcrun altool --upload-app -f "$IPA_PATH" -t ios -u "$APPLE_ID" -p "$APP_SPECIFIC_PASSWORD"
echo "Upload finished."
