#!/bin/bash

set -euo pipefail

MODE="${1:-web}"
EXPECTED_SUPABASE_PROJECT_REF="${EXPECTED_SUPABASE_PROJECT_REF:-zbtbtmybzuutxfntdyvp}"

if [[ "$MODE" != "web" && "$MODE" != "ios" ]]; then
  echo "Usage: ./scripts/run-qa-gates.sh [web|ios]"
  exit 1
fi

echo "Running QA gates (mode: $MODE)"
echo "Expected Supabase project ref: $EXPECTED_SUPABASE_PROJECT_REF"

npm run typecheck
npm run test:ci
npm run build
node ./scripts/verify-supabase-ref.mjs --dir dist/assets --expected-ref "$EXPECTED_SUPABASE_PROJECT_REF" --context "web dist bundle"

if [[ "$MODE" == "ios" ]]; then
  npm run ios:sync
  node ./scripts/verify-supabase-ref.mjs --dir ios/App/App/public/assets --expected-ref "$EXPECTED_SUPABASE_PROJECT_REF" --context "iOS synced bundle"
fi

echo "QA gates passed (mode: $MODE)"
