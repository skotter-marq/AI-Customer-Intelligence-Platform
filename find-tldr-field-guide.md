# How to Find Your JIRA TL;DR Custom Field ID

Since we're having authentication issues with the API, here are several ways to find your TL;DR custom field ID:

## Method 1: Browser Inspector (Recommended)

1. **Open a JIRA issue** in your browser that has the "TL;DR" field
2. **Right-click on the TL;DR field** and select "Inspect Element"
3. **Look for the field identifier** in the HTML, it will look like:
   ```html
   <input id="customfield_10037" name="customfield_10037" ...>
   <!-- OR -->
   <div data-field-id="customfield_10037" ...>
   ```
4. **Note the field ID** (e.g., `customfield_10037`)

## Method 2: JIRA Admin Configuration

1. **Go to JIRA Settings** → **Issues** → **Custom Fields**
2. **Find the "TL;DR" field** in the list
3. **Click on the gear icon** next to it or edit it
4. **Look at the URL** - it will contain the field ID like `/customfield/10037`

## Method 3: JIRA REST API Browser

1. **Go to your JIRA instance** → **Settings** → **System** → **Advanced**
2. **Find "REST API Browser"** or go to `https://marq.atlassian.net/rest/api/3/field`
3. **Look for your TL;DR field** in the JSON response
4. **Note the field ID**

## Method 4: Webhook Payload Inspection

If you have a webhook payload from JIRA, the field will be listed under `issue.fields` like:
```json
{
  "issue": {
    "fields": {
      "customfield_10037": "Your TL;DR content here",
      ...
    }
  }
}
```

## Common TL;DR Field IDs

Based on typical JIRA setups, the TL;DR field is often one of these:
- `customfield_10037`
- `customfield_10036` 
- `customfield_10038`
- `customfield_10040`

## Once You Find the Field ID

1. **Add it to your `.env.local` file**:
   ```bash
   JIRA_TLDR_FIELD_ID=customfield_10037
   ```

2. **Or update the code directly** in `lib/jira-integration.js` line 403:
   ```javascript
   const TLDR_FIELD_ID = 'customfield_10037'; // Your actual field ID
   ```

## Testing the Integration

Once configured, you can test by:
1. **Triggering a JIRA webhook** (change a story status to Done)
2. **Approving the changelog entry** in your app
3. **Checking the JIRA issue** to see if the TL;DR field was updated

The system will log the update attempt in the console, so you can see if it's working.