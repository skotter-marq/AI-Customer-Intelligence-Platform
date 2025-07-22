#!/bin/bash

# Setup terminal aliases for quick development
PROJECT_PATH="/Users/spencerkotter/customer-intelligence-platform"

echo "Setting up terminal aliases..."

# Check which shell is being used
SHELL_CONFIG=""
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ -n "$SHELL_CONFIG" ]; then
    # Add aliases to shell config
    echo "" >> "$SHELL_CONFIG"
    echo "# Customer Intelligence Platform shortcuts" >> "$SHELL_CONFIG"
    echo "alias ci-dev='cd $PROJECT_PATH && ./dev-start.sh'" >> "$SHELL_CONFIG"
    echo "alias ci-build='cd $PROJECT_PATH && npm run build'" >> "$SHELL_CONFIG"
    echo "alias ci-test='cd $PROJECT_PATH && npm run test'" >> "$SHELL_CONFIG"
    echo "alias ci-lint='cd $PROJECT_PATH && npm run lint'" >> "$SHELL_CONFIG"
    echo "alias ci-cd='cd $PROJECT_PATH'" >> "$SHELL_CONFIG"
    echo "alias ci-open='open http://localhost:3000'" >> "$SHELL_CONFIG"
    
    echo "✅ Added aliases to $SHELL_CONFIG"
    echo ""
    echo "Available shortcuts (restart terminal or run 'source $SHELL_CONFIG'):"
    echo "  ci-dev    - Start development server"
    echo "  ci-build  - Build for production"
    echo "  ci-test   - Run tests"
    echo "  ci-lint   - Run linting"
    echo "  ci-cd     - Navigate to project directory"
    echo "  ci-open   - Open localhost:3000 in browser"
else
    echo "⚠️ Could not determine shell type. Please add aliases manually."
fi