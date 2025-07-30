# Slack Integration Setup Guide

## Step-by-Step Setup

### 1. Create Slack App
- Go to https://api.slack.com/apps
- Click "Create New App" → "From scratch"
- Name: "Customer Intelligence Bot"
- Select your workspace

### 2. Configure OAuth & Permissions
Go to "OAuth & Permissions" and add these scopes:
```
chat:write
chat:write.public
channels:read
groups:read
im:read
mpim:read
```

### 3. Install App to Workspace
- Click "Install to Workspace"
- Copy the Bot User OAuth Token (starts with xoxb-)

### 4. Get Signing Secret
- Go to "Basic Information"
- Copy the Signing Secret from "App Credentials"

### 5. Create Slack Channels
Create these channels in your workspace:
- #content-approvals
- #product-updates

### 6. Update .env.local
Replace these values in your .env.local:
```bash
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
SLACK_SIGNING_SECRET=your-actual-signing-secret
SLACK_CHANNEL_APPROVALS=#content-approvals
SLACK_CHANNEL_NOTIFICATIONS=#product-updates
```

### 7. Optional: Set up Slash Commands
If you want slash commands like /content-stats:
- Go to "Slash Commands" in your Slack app
- Create commands pointing to your app URLs

### 8. Test Integration
Run: `node test-real-data-pipeline.js`

## Required Environment Variables for Production

Add these to your Vercel environment variables:
- SLACK_BOT_TOKEN
- SLACK_SIGNING_SECRET  
- SLACK_CHANNEL_APPROVALS
- SLACK_CHANNEL_NOTIFICATIONS
- NEXT_PUBLIC_BASE_URL (your production URL)