# Zapier Integration Guide

## ✅ UPDATED: Native Grain App Integration

Your webhook now supports **both methods**:
1. **Native Grain Zapier App** (Recommended)
2. **Generic Webhook** (Alternative)

## Method 1: Native Grain Zapier App (Recommended)

### Step 1: Use Grain's Official Zapier App
1. Go to Zapier.com and create new Zap
2. **Trigger**: Search for "Grain" → Select "Recording Added"
3. Connect your Grain account
4. Test the trigger to see available fields

### Step 2: Set Up Action
1. **Action**: Webhooks by Zapier → "POST"
2. **URL**: `https://your-app.vercel.app/api/grain-webhook`
3. **Method**: POST
4. **Data**: Use Grain's native fields (auto-detected):

```json
{
  "recording_id": "{{recording_id}}",
  "title": "{{title}}",
  "recorded_at": "{{recorded_at}}",
  "duration_seconds": "{{duration_seconds}}",
  "transcript": "{{transcript}}",
  "organizer_name": "{{organizer_name}}",
  "organizer_email": "{{organizer_email}}",
  "attendee_1_name": "{{attendee_1_name}}",
  "attendee_1_email": "{{attendee_1_email}}",
  "recording_url": "{{recording_url}}"
}
```

✅ **Your app automatically detects and processes this format!**

## Method 2: Generic Webhook (Alternative)

### Step 1: Create Zapier Webhook
1. Go to Zapier.com and create new Zap
2. **Trigger**: Webhooks by Zapier → "Catch Hook"
3. Copy the webhook URL Zapier provides

### Step 2: Configure Grain to Send to Zapier
1. In Grain workspace settings, add the Zapier webhook URL
2. Subscribe to events: `meeting.transcribed` (this has the transcript)

### Step 3: Set Up Zapier Action
1. **Action**: Webhooks by Zapier → "POST"
2. **URL**: `https://your-app.vercel.app/api/grain-webhook`
3. **Method**: POST
4. **Data**: Map Grain fields to your expected format:

```json
{
  "event": "meeting.transcribed",
  "meeting_id": "{{grain_meeting_id}}",
  "meeting": {
    "id": "{{grain_meeting_id}}",
    "title": "{{meeting_title}}",
    "transcript": "{{transcript_text}}",
    "started_at": "{{meeting_date}}",
    "duration": "{{duration_seconds}}",
    "attendees": "{{attendees}}"
  }
}
```

### Step 4: Test the Integration
1. Have a test meeting in Grain
2. Check Zapier logs to see if trigger fires
3. Check your app logs to see webhook received
4. Verify meeting appears in your dashboard

## Alternative: Direct Grain API Integration

If you have Grain API access, you can also poll for new meetings:

```javascript
// Add to your codebase
async function syncGrainMeetings() {
  const response = await fetch('https://api.grain.com/meetings', {
    headers: { 'Authorization': `Bearer ${process.env.GRAIN_API_KEY}` }
  });
  
  const meetings = await response.json();
  
  for (const meeting of meetings) {
    // Process each meeting through your webhook
    await fetch('/api/grain-webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'meeting.transcribed',
        meeting: meeting
      })
    });
  }
}
```

## Testing Your Integration

We have test scripts for both formats:

**Test Native Grain Zapier App format:**
```bash
node test-zapier-grain-webhook.js
```

**Test Generic Webhook format:**
```bash
node test-grain-webhook-realistic.js
```

Both formats are automatically detected and processed by your webhook endpoint!

## Integration Status

✅ **Webhook Format Detection**: Automatically detects Zapier vs direct Grain webhooks  
✅ **Data Mapping**: Handles different field names and structures  
✅ **Participant Parsing**: Supports JSON, comma-separated, and individual attendee fields  
✅ **AI Analysis**: Works with both webhook formats  
✅ **Error Handling**: Robust error handling and logging  
✅ **Backward Compatibility**: Direct Grain webhooks still work

## Supported Zapier Field Variations

Your webhook intelligently handles these field name variations:
- `recording_id`, `grain_recording_id`, `id`
- `title`, `grain_meeting_title`, `meeting_title`
- `recorded_at`, `created_at`, `started_at`
- `duration_seconds`, `duration_minutes`, `duration`
- `transcript`, `transcript_text`
- `participants` (JSON), `attendees`, individual `attendee_X_name` fields