#!/bin/bash

# Book Thingy macOS Build Script
echo "🍎 Building Book Thingy for macOS..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script must be run on macOS"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build the app
echo "🔨 Building macOS app..."
npm run build-mac

# Check if build was successful
if [ -f "dist/Book Thingy-1.0.0.dmg" ]; then
    echo "✅ Build successful!"
    echo "📦 Output: dist/Book Thingy-1.0.0.dmg"
    echo "💾 Size: $(du -h "dist/Book Thingy-1.0.0.dmg" | cut -f1)"
    
    # Open the dist folder
    open dist/
    
    echo ""
    echo "🚀 To install:"
    echo "   1. Mount the DMG file"
    echo "   2. Drag Book Thingy to Applications"
    echo "   3. Right-click → Open (first time only)"
    
else
    echo "❌ Build failed!"
    echo "Check the output above for errors."
    exit 1
fi