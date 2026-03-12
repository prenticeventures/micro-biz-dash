#!/bin/bash

set -euo pipefail

FLOW_PATH="${MAESTRO_FLOW_PATH:-maestro/ios-level2-smoke.yaml}"
export MAESTRO_CLI_NO_ANALYTICS="${MAESTRO_CLI_NO_ANALYTICS:-1}"
export MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED="${MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED:-true}"
MAESTRO_USER_HOME="${MAESTRO_USER_HOME:-${TMPDIR:-/tmp}/maestro-user-home}"
mkdir -p "$MAESTRO_USER_HOME/.maestro"
export JAVA_TOOL_OPTIONS="-Duser.home=$MAESTRO_USER_HOME ${JAVA_TOOL_OPTIONS:-}"

if ! command -v maestro >/dev/null 2>&1; then
  echo "Maestro CLI is not installed."
  echo "Install it from https://docs.maestro.dev/ and then rerun: npm run test:ios:smoke"
  exit 1
fi

echo "Running Maestro smoke flow: $FLOW_PATH"
maestro test "$FLOW_PATH"
