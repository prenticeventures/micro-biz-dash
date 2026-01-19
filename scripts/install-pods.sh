#!/bin/bash
# Install CocoaPods dependencies
# This script handles finding pod and installing dependencies

set -e

cd "$(dirname "$0")/../ios/App"

echo "🔍 Looking for CocoaPods..."

# Set up PATH for Homebrew Ruby (if installed)
export PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"

# Try different methods to find pod
if command -v pod &> /dev/null; then
    POD_CMD="pod"
elif [ -f "/opt/homebrew/lib/ruby/gems/4.0.0/bin/pod" ]; then
    POD_CMD="/opt/homebrew/lib/ruby/gems/4.0.0/bin/pod"
elif [ -f "$HOME/.gem/ruby/2.6.0/bin/pod" ]; then
    POD_CMD="$HOME/.gem/ruby/2.6.0/bin/pod"
    export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
elif [ -f "/usr/local/bin/pod" ]; then
    POD_CMD="/usr/local/bin/pod"
else
    echo "❌ CocoaPods not found!"
    echo ""
    echo "Please install CocoaPods first:"
    echo "  brew install ruby"
    echo "  export PATH=\"/opt/homebrew/opt/ruby/bin:\$PATH\""
    echo "  gem install cocoapods"
    exit 1
fi

echo "✅ Found CocoaPods at: $POD_CMD"
echo "📦 Installing iOS dependencies..."
echo ""

$POD_CMD install

echo ""
echo "✅ Pod install complete!"
