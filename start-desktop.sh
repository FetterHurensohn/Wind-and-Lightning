#!/bin/bash
# Start CapCut Video Editor Desktop App

echo "🎬 CapCut Video Editor - Desktop App"
echo "===================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if electron is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

echo "🚀 Starting Electron app in development mode..."
echo ""
echo "This will:"
echo "  1. Start Vite dev server on http://localhost:3000"
echo "  2. Open Electron desktop window"
echo "  3. Open DevTools for debugging"
echo ""

npm run electron:dev
