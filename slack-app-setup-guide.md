# 🔧 Slack App Setup Guide for Interactive Buttons

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Name: `Changelog Bot`
4. Select your workspace

## Step 2: Configure Interactive Components

### Enable Interactivity
1. Go to **"Interactivity & Shortcuts"** in sidebar
2. Turn on **"Interactivity"**
3. Set **Request URL** to: `https://your-domain.com/api/slack`
   - Replace `your-domain.com` with your actual domain
   - This handles button clicks

### Webhook URLs (Already Configured! ✅)
Your `.env.local` already has these configured:
```env
SLACK_WEBHOOK_APPROVALS=https://hooks.slack.com/services/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
SLACK_WEBHOOK_UPDATES=https://hooks.slack.com/services/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
SLACK_WEBHOOK_INSIGHTS=https://hooks.slack.com/services/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
SLACK_WEBHOOK_CONTENT=https://hooks.slack.com/services/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
```

## Step 3: Set Permissions

### OAuth & Permissions
1. Go to **"OAuth & Permissions"**
2. Add these **Bot Token Scopes**:
   - `chat:write` - Send messages
   - `chat:write.public` - Send to public channels
   - `channels:read` - Read channel info
   - `groups:read` - Read private channel info

### Install App
1. Click **"Install to Workspace"**
2. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
3. Add to your `.env.local`:
```env
SLACK_BOT_TOKEN=xoxb-your-token-here
```

## Step 4: Test the Integration

### Current Working Features ✅
- ✅ Webhook notifications (sending messages)
- ✅ Interactive button structure
- ✅ Message formatting and templates
- ✅ Different webhook routing

### To Enable Button Clicks:
1. Set the **Request URL** in Slack app settings
2. Deploy your app so Slack can reach the `/api/slack` endpoint
3. Buttons will then trigger the approval/rejection workflow

## Step 5: Message Examples

### What Users See in Slack:
```
📋 Changelog Approval Required

PRESS-21463 has been completed and needs changelog approval.

Title: Enhanced Video Integration for Navigation Bar
Category: feature_update
Summary: We've added seamless video integration to the navi...

[📊 View Dashboard] [✏️ Edit Entry] [🎫 JIRA Ticket]

[✅ Approve & Publish] [✏️ Request Changes] [❌ Reject]
```

### When Users Click Buttons:
- **✅ Approve & Publish** → Entry goes live immediately
- **✏️ Request Changes** → Entry stays in draft for revisions  
- **❌ Reject** → Entry is removed from approval queue

## Step 6: Production Deployment

### For Vercel/Production:
1. Add all environment variables to Vercel
2. Set Slack Request URL to: `https://your-app.vercel.app/api/slack`
3. Test with a real changelog approval

### Channels:
- **#content-approvals** → Gets approval requests
- **#product-updates** → Gets published updates
- **#customer-insights** → Gets insight alerts
- **#general-content** → Gets other notifications

## 🚀 You're All Set!

Your Slack integration is configured and ready to use. The interactive buttons will work once you:
1. Set the Request URL in your Slack app
2. Deploy to production so Slack can reach your endpoints
3. Test with a real changelog entry

The webhook URLs are already working for sending notifications! 🎉