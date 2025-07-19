#!/bin/bash

echo "🚀 Starting Customer Intelligence Platform Development Server"
echo "=================================================="

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "   No existing processes found on port 3000"

# Kill any existing Node/Next processes from this project
pkill -f "next dev" 2>/dev/null || echo "   No existing Next.js processes found"

# Wait a moment for cleanup
sleep 1

# Check for common issues
echo "🔍 Checking for common issues..."

# Check for duplicate route files
if [ -f "app/api/monitoring/route.js" ] && [ -f "app/api/monitoring/route.ts" ]; then
    echo "⚠️  Found duplicate monitoring route files - removing .ts version"
    rm app/api/monitoring/route.ts
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found - you may need to set up environment variables"
fi

# Start the development server
echo "🔄 Starting development server with Turbopack..."
echo "   URL: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev --turbopack