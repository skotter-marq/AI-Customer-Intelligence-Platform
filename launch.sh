#!/bin/bash

# Simple launcher with options
echo "🚀 Customer Intelligence Platform Launcher"
echo "=========================================="
echo ""
echo "Choose an option:"
echo "1) Start development server (recommended)"
echo "2) Start dev server + open browser"
echo "3) Build for production"
echo "4) Run tests"
echo "5) Open project in VS Code"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo "Starting development server..."
        ./dev-start.sh
        ;;
    2)
        echo "Starting development server and opening browser..."
        ./dev-start.sh &
        sleep 3
        open "http://localhost:3000"
        wait
        ;;
    3)
        echo "Building for production..."
        npm run build
        ;;
    4)
        echo "Running tests..."
        npm test
        ;;
    5)
        echo "Opening in VS Code..."
        code .
        ;;
    *)
        echo "Invalid option. Starting development server..."
        ./dev-start.sh
        ;;
esac