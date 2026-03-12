#!/bin/bash

set -euo pipefail

MODE="${1:-web}"
EXPECTED_SUPABASE_PROJECT_REF="${EXPECTED_SUPABASE_PROJECT_REF:-zbtbtmybzuutxfntdyvp}"
ONLINE_SERVICES_ENABLED="${VITE_ENABLE_ONLINE_SERVICES:-0}"

if [[ "$MODE" != "web" && "$MODE" != "ios" ]]; then
  echo "Usage: ./scripts/run-qa-gates.sh [web|ios]"
  exit 1
fi

echo "Running QA gates (mode: $MODE)"
echo "Expected Supabase project ref: $EXPECTED_SUPABASE_PROJECT_REF"
echo "Online services enabled: $ONLINE_SERVICES_ENABLED"

npm run typecheck
npm run test:ci
npm run build

if [[ "$ONLINE_SERVICES_ENABLED" == "1" ]]; then
  node ./scripts/verify-supabase-ref.mjs --dir dist/assets --expected-ref "$EXPECTED_SUPABASE_PROJECT_REF" --context "web dist bundle"
else
  echo "Skipping Supabase bundle verification because online services are disabled."
fi

if [[ "$MODE" == "ios" ]]; then
  if [[ -d ios/App/build ]]; then
    echo "Removing stale iOS release build output..."
    rm -rf ios/App/build
  fi

  npm run ios:sync
  if [[ "$ONLINE_SERVICES_ENABLED" == "1" ]]; then
    node ./scripts/verify-supabase-ref.mjs --dir ios/App/App/public/assets --expected-ref "$EXPECTED_SUPABASE_PROJECT_REF" --context "iOS synced bundle"
  else
    echo "Skipping iOS Supabase bundle verification because online services are disabled."
  fi
  npm run test:ios:smoke
fi

echo "QA gates passed (mode: $MODE)"
