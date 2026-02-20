#!/bin/bash

# Script to switch between development and production environments
# Usage: ./scripts/switch-env.sh [dev|prod]

ENV_FILE=".env.local"
BACKUP_FILE=".env.local.backup"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env.local file not found!${NC}"
    exit 1
fi

# Backup current .env.local
cp "$ENV_FILE" "$BACKUP_FILE"
echo -e "${YELLOW}Backed up current .env.local to .env.local.backup${NC}"

# Determine target environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
    TARGET="production"
    URL="https://zbtbtmybzuutxfntdyvp.supabase.co"
    KEY="sb_publishable_h2xnM0BR5neCzYMvIUz-yQ_YIDLinkS"
    echo -e "${GREEN}Switching to PRODUCTION environment...${NC}"
elif [ "$1" == "dev" ] || [ "$1" == "development" ]; then
    TARGET="development"
    URL="https://vgkpbslbfvcwvlmwkowj.supabase.co"
    KEY="sb_publishable_7EPoMgV5Bsec_-yV7rF2qg_XobTArmb"
    echo -e "${GREEN}Switching to DEVELOPMENT environment...${NC}"
else
    echo -e "${RED}Usage: ./scripts/switch-env.sh [dev|prod]${NC}"
    echo ""
    echo "Examples:"
    echo "  ./scripts/switch-env.sh dev   # Switch to development"
    echo "  ./scripts/switch-env.sh prod  # Switch to production"
    exit 1
fi

if [ "$TARGET" = "production" ]; then
    TARGET_UPPER="PRODUCTION"
    TARGET_LABEL="Production"
else
    TARGET_UPPER="DEVELOPMENT"
    TARGET_LABEL="Development"
fi

EMAIL_CONFIRMATION_STATUS="DISABLED"
if [ "$TARGET" = "production" ]; then
    EMAIL_CONFIRMATION_STATUS="ENABLED"
fi

cat > "$ENV_FILE" << EOF
# Supabase Configuration
# This file is gitignored - contains sensitive credentials

# ============================================================================
# ${TARGET_UPPER} ENVIRONMENT
# ============================================================================
# ${TARGET_LABEL} project: micro-biz-dash
# - Email confirmation: ${EMAIL_CONFIRMATION_STATUS}
# - $([ "$TARGET" = "production" ] && echo "Production data" || echo "Higher rate limits for testing")
VITE_SUPABASE_URL=${URL}
VITE_SUPABASE_ANON_KEY=${KEY}
EOF

if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    {
        echo ""
        echo "# Optional local tooling token (not used by the app itself)"
        echo "SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN}"
    } >> "$ENV_FILE"
fi

echo -e "${GREEN}✓ Switched to ${TARGET_LABEL} environment${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Test authentication to verify it's working"
echo ""
echo -e "${YELLOW}Note:${NC} If something goes wrong, restore from backup:"
echo "  cp .env.local.backup .env.local"
