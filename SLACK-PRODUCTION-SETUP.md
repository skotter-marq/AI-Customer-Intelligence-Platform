# 🚀 Slack Production Setup Guide

## Step 1: Update Production URLs

### Option A: If using Vercel
1. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```
   
2. **Get your production URL** (example: `https://customer-intelligence-platform.vercel.app`)

3. **Update Environment Variable**:
   - In Vercel dashboard: Settings → Environment Variables
   - Update `NEXT_PUBLIC_BASE_URL` to your production URL
   - **OR** update `.env.local` locally:
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-actual-vercel-url.vercel.app
   ```

### Option B: If using custom domain
Replace `https://your-app-name.vercel.app` with your actual domain:
```env
NEXT_PUBLIC_BASE_URL=https://your-custom-domain.com
```

## Step 2: Configure Slack App Request URL

### 🔗 Where to Set the Request URL:

1. **Go to [api.slack.com/apps](https://api.slack.com/apps)**

2. **Select your app** (or create new app if you haven't)

3. **In the left sidebar, click "Interactivity & Shortcuts"**

4. **Toggle "Interactivity" to ON**

5. **Set Request URL** to:
   ```
   https://your-production-url.com/api/slack
   ```
   
   Examples:
   - Vercel: `https://customer-intelligence-platform.vercel.app/api/slack`
   - Custom domain: `https://yourcompany.com/api/slack`

6. **Click "Save Changes"**

### 📱 Visual Guide - Where to Find It:

```
Slack App Settings → Left Sidebar:
├── Basic Information
├── OAuth & Permissions  
├── 🎯 Interactivity & Shortcuts  ← Click here!
├── Slash Commands
├── Event Subscriptions
└── Bot Users
```

Inside "Interactivity & Shortcuts":
```
┌─────────────────────────────────────────┐
│ Interactivity                           │
│ ○ Off  ● On  ← Toggle this ON          │
│                                         │
│ Request URL (required)                  │
│ ┌─────────────────────────────────────┐ │
│ │ https://your-app.vercel.app/api/... │ │ ← Enter your URL here
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save Changes]                          │
└─────────────────────────────────────────┘
```

## Step 3: Test Production Setup

### Test the Links:
Once deployed, your Slack messages will have these working links:

1. **📊 Dashboard**: `https://your-domain.com/product`
2. **✏️ Edit Entry**: `https://your-domain.com/product#entry-{id}`  
3. **🎫 JIRA Ticket**: `https://marq.atlassian.net/browse/{jiraKey}`

### Test Button Interactions:
1. **Send a test approval notification**
2. **Click the buttons in Slack**
3. **Verify they trigger the approval workflow**

## Step 4: Environment Variables for Production

### Required Variables in Vercel/Production:
```env
# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-production-url.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yipbkonxdnlpvororuau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# JIRA Integration  
JIRA_BASE_URL=https://marq.atlassian.net
JIRA_API_TOKEN=ATATT...
JIRA_USERNAME=skotter@marq.com
JIRA_PROJECT_KEY=PRESS
JIRA_TLDR_FIELD_ID=customfield_10087

# Slack Integration
SLACK_WEBHOOK_APPROVALS=https://hooks.slack.com/services/...
SLACK_WEBHOOK_UPDATES=https://hooks.slack.com/services/...
SLACK_WEBHOOK_INSIGHTS=https://hooks.slack.com/services/...
SLACK_WEBHOOK_CONTENT=https://hooks.slack.com/services/...

# AI Integration
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Step 5: Verify Everything Works

### ✅ Checklist:
- [ ] App deployed to production
- [ ] `NEXT_PUBLIC_BASE_URL` points to production URL
- [ ] Slack Request URL configured
- [ ] Test notification sends successfully
- [ ] Links in Slack work correctly
- [ ] Buttons trigger approval actions
- [ ] Admin interface accessible at `/admin/ai-prompts`

## 🎯 Quick Test Commands

### Test Production Slack Notification:
```bash
curl -X POST https://your-domain.com/api/slack \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approval_request",
    "contentId": "test-123",
    "contentTitle": "Test Production Notification", 
    "jiraKey": "PRESS-TEST",
    "category": "feature_update",
    "contentSummary": "Testing production Slack integration"
  }'
```

### Expected Slack Message:
```
📋 Changelog Bot

📋 Changelog Approval Required

PRESS-TEST has been completed and needs changelog approval.

Title: Test Production Notification
Category: feature_update
Summary: Testing production Slack integration

📊 View Dashboard | ✏️ Edit Entry | 🎫 JIRA Ticket

[✅ Approve & Publish] [✏️ Request Changes] [❌ Reject]
```

## 🚀 You're All Set!

Once these steps are complete:
- ✅ Slack notifications will have production URLs
- ✅ Interactive buttons will work in Slack
- ✅ Team can approve changelogs directly from Slack
- ✅ Admin can customize templates at `/admin/ai-prompts`

---

**Need help?** Check the Slack App's "Event Subscriptions" logs to see if your Request URL is being hit correctly!