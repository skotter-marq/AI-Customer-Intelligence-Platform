#!/bin/bash

# Script to get your production URL and update environment variables

echo "🔍 Getting your production URL..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Get the production URL
echo "🚀 Getting Vercel production URL..."
PRODUCTION_URL=$(vercel ls --scope team 2>/dev/null | grep "customer-intelligence" | head -1 | awk '{print $2}' | tr -d ' ')

if [ -z "$PRODUCTION_URL" ]; then
    echo "⚠️  No production deployment found. Run 'vercel --prod' first."
    echo ""
    echo "📋 Steps to deploy:"
    echo "1. Run: vercel --prod"
    echo "2. Copy the production URL"
    echo "3. Update NEXT_PUBLIC_BASE_URL in your environment"
    echo ""
    exit 1
fi

# Format the URL properly
if [[ $PRODUCTION_URL != https://* ]]; then
    PRODUCTION_URL="https://$PRODUCTION_URL"
fi

echo "✅ Found production URL: $PRODUCTION_URL"
echo ""

# Update .env.local
echo "🔧 Updating .env.local..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$PRODUCTION_URL|" .env.local
else
    # Linux
    sed -i "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$PRODUCTION_URL|" .env.local
fi

echo "✅ Updated .env.local with production URL"
echo ""

# Show next steps
echo "🎯 Next Steps:"
echo "1. Deploy your changes: vercel --prod"
echo "2. Set Slack Request URL to: $PRODUCTION_URL/api/slack"
echo "3. Go to: https://api.slack.com/apps"
echo "4. Click your app → Interactivity & Shortcuts"
echo "5. Set Request URL: $PRODUCTION_URL/api/slack"
echo ""

echo "🔗 Your production links will be:"
echo "📊 Dashboard: $PRODUCTION_URL/product"
echo "⚙️  Admin: $PRODUCTION_URL/admin/ai-prompts"
echo "🤖 Slack API: $PRODUCTION_URL/api/slack"