#!/bin/bash

# Create macOS app shortcut for development environment
APP_NAME="Customer Intelligence Dev"
PROJECT_PATH="/Users/spencerkotter/customer-intelligence-platform"

# Create .app bundle
mkdir -p "$HOME/Desktop/${APP_NAME}.app/Contents/MacOS"
mkdir -p "$HOME/Desktop/${APP_NAME}.app/Contents/Resources"

# Create Info.plist
cat > "$HOME/Desktop/${APP_NAME}.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>start-dev</string>
    <key>CFBundleIdentifier</key>
    <string>com.customerintelligence.dev</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
</dict>
</plist>
EOF

# Create executable script
cat > "$HOME/Desktop/${APP_NAME}.app/Contents/MacOS/start-dev" << 'EOF'
#!/bin/bash
cd "/Users/spencerkotter/customer-intelligence-platform"

# Open terminal and run dev script
osascript << 'APPLESCRIPT'
tell application "Terminal"
    activate
    do script "cd '/Users/spencerkotter/customer-intelligence-platform' && ./dev-start.sh"
end tell
APPLESCRIPT

# Also open browser after a delay
sleep 3
open "http://localhost:3000"
EOF

# Make executable
chmod +x "$HOME/Desktop/${APP_NAME}.app/Contents/MacOS/start-dev"

echo "✅ Created ${APP_NAME}.app on your Desktop!"
echo "   Double-click it to start your development environment"