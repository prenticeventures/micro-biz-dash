#!/bin/bash
# Build and run iOS app in simulator from command line

set -e

cd "$(dirname "$0")/../ios/App"

echo "🔍 Finding available iOS simulators..."

# List available simulators
SIMULATORS=$(xcrun simctl list devices available | grep -E "iPhone|iPad" | grep -v "unavailable" | head -1)

if [ -z "$SIMULATORS" ]; then
    echo "❌ No simulators found!"
    echo ""
    echo "Please open Xcode and:"
    echo "1. Go to Xcode > Settings > Platforms"
    echo "2. Download iOS Simulator runtime"
    echo "3. Or use: xcodebuild -downloadPlatform iOS"
    exit 1
fi

echo "📱 Available simulators:"
xcrun simctl list devices available | grep -E "iPhone|iPad" | head -5

# Try to get the first iPhone simulator
SIMULATOR=$(xcrun simctl list devices available | grep "iPhone" | head -1 | sed 's/.*(\(.*\))/\1/' | tr -d ' ')

if [ -z "$SIMULATOR" ]; then
    echo "⚠️  Could not auto-detect simulator"
    echo "Please specify manually or use Xcode GUI"
    exit 1
fi

echo ""
echo "🚀 Building for simulator: $SIMULATOR"
echo ""

# Build the project
xcodebuild -workspace App.xcworkspace \
    -scheme App \
    -destination "platform=iOS Simulator,id=$SIMULATOR" \
    -derivedDataPath ./build \
    build

echo ""
echo "✅ Build complete!"
echo ""
echo "To run in simulator, use Xcode GUI or:"
echo "  xcrun simctl boot $SIMULATOR"
echo "  xcrun simctl install booted ./build/Build/Products/Debug-iphonesimulator/App.app"
echo "  xcrun simctl launch booted com.microbizdash.app"
