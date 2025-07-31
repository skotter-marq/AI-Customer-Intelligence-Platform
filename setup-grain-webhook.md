# Grain Webhook Setup Guide

## Option 1: Direct Grain Webhook (Recommended)

### Webhook URL:
```
https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/grain-webhook
```

### Events to Enable:
- ✅ `meeting.recorded` - Initial meeting data
- ✅ `meeting.transcribed` - Transcript becomes available  
- ✅ `meeting.shared` - Meeting shared publicly

### What You Get:
- **Immediate**: Meeting title, participants, estimated duration
- **When Ready**: Full transcript, exact duration, AI analysis
- **Automatic**: Customer identification, Slack notifications

## Option 2: Zapier Integration (Alternative)

### Setup Steps:
1. **Trigger**: Grain "Recording Added"
2. **Action**: Webhooks by Zapier → POST
3. **URL**: Same webhook URL above
4. **Payload**: Forward all Grain data

### Benefits:
- More reliable delivery
- Visual interface
- Built-in retry logic
- Can combine multiple Grain events

## Option 3: Hybrid Approach (Best of Both)

Use **both** direct webhooks AND Zapier:
- **Direct webhooks** for real-time processing
- **Zapier** as backup/enrichment source

## Expected Data Flow:

```
Meeting Ends → Grain Processing → Webhook Sent
     ↓
📊 Basic Data Saved (title, participants, estimated duration)
     ↓  
🤖 Customer Matching (auto-create from attendees)
     ↓
📝 Transcript Ready → Second Webhook → AI Analysis
     ↓
✅ Complete Meeting Record + Insights + Slack Notifications
```

## Troubleshooting:

**No transcript?** 
- Check if Grain has transcription enabled
- Verify `meeting.transcribed` event is configured
- Some meetings may not auto-transcribe

**Missing duration?**
- Webhook estimates from meeting type/title
- Real duration comes with transcript event
- Zapier usually includes actual duration

**No customer ID?**
- Webhook tries to match external attendees
- Creates new customer from email domains
- May need manual customer assignment for some meetings