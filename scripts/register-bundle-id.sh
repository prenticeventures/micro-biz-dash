#!/bin/bash
# Script to help register bundle ID in Apple Developer Portal
# This opens the Developer Portal registration page

BUNDLE_ID="com.microbizdash.game"
TEAM_ID="JWMK399CXD"

echo "📱 Bundle ID Registration Helper"
echo "================================"
echo ""
echo "Bundle ID: $BUNDLE_ID"
echo "Team ID: $TEAM_ID"
echo ""
echo "Opening Apple Developer Portal in your browser..."
echo ""

# Open the Developer Portal identifiers page
open "https://developer.apple.com/account/resources/identifiers/list"

echo "✅ Browser opened!"
echo ""
echo "📋 Next steps:"
echo "1. Click the '+' button to add a new identifier"
echo "2. Select 'App IDs' → Continue"
echo "3. Select 'App' → Continue"
echo "4. Description: Micro-Biz Dash"
echo "5. Bundle ID: Explicit"
echo "6. Enter: $BUNDLE_ID"
echo "7. Click 'Continue' → 'Register'"
echo ""
echo "After registering, try archiving again in Xcode."
