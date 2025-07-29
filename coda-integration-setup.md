# Coda Integration Setup Guide

## Overview

The Coda integration allows you to create external research initiatives directly from meeting cards in your dashboard. When you click the Coda button on a meeting, it creates a new row in your Coda research table with all the meeting details, topics, and analysis.

## Prerequisites

1. **Coda Account**: You need a Coda account with access to create documents and tables
2. **API Token**: Generate a Coda API token for authentication
3. **Research Table**: Set up a table in Coda with the appropriate columns

## Step 1: Generate Coda API Token

1. Sign in to your Coda account
2. Go to **Account Settings** → **API Settings**
3. Click **"Generate API token"**
4. Give it a name (e.g., "Customer Intelligence Platform")
5. Copy the generated token

## Step 2: Add API Token to Environment

Add your Coda API token to your `.env.local` file:

```bash
CODA_API_TOKEN=your_api_token_here
```

## Step 3: Create Research Table in Coda

Create a new Coda document or use an existing one, then create a table with these columns:

### Required Columns:
- **Initiative Title** (Text)
- **Source Meeting** (Text) 
- **Customer/Company** (Text)
- **Meeting Date** (Date)
- **Priority** (Select: High, Medium, Low)
- **Status** (Select: New, In Progress, Completed)
- **Research Topics** (Text)
- **Meeting Summary** (Text)
- **Action Items** (Text)
- **Sentiment** (Select: positive, neutral, negative)
- **Attendees** (Text)
- **Created Date** (Date)
- **Meeting ID** (Text)

### Optional Columns (you can add these for additional tracking):
- **Assigned To** (Person)
- **Due Date** (Date)
- **Research Notes** (Text)
- **Follow-up Required** (Checkbox)
- **Research Category** (Select)

## Step 4: Get Document and Table IDs

### Get Document ID:
1. Open your Coda document
2. Look at the URL: `https://coda.io/d/fO4lZoHIBD/...`
3. The document ID is the part after `/d/` (e.g., `fO4lZoHIBD`)

### Get Table ID:
1. Right-click on your table in Coda
2. Select **"Copy table ID"**
3. The table ID will be copied to your clipboard (e.g., `table-abc-123`)

## Step 5: Configure Integration

1. Go to your meetings dashboard
2. Click the **Coda button** (📄 icon) on any meeting card
3. Enter your **Document ID** and **Table ID** in the modal
4. The IDs will be saved automatically for future use

## Usage

1. **Create Initiative**: Click the Coda button on any meeting card
2. **Review Details**: The modal shows what will be created in Coda
3. **Configure IDs**: Enter your document and table IDs (first time only)
4. **Create**: Click "Create Initiative" to add the row to Coda
5. **Open Coda**: Optionally open the Coda document directly

## What Gets Created

Each research initiative includes:

- **Initiative Title**: "Research: [Meeting Title]"
- **Meeting Context**: Customer, date, duration, attendees
- **Analysis Data**: Key topics, sentiment, action items
- **Priority Level**: Auto-calculated based on meeting factors
- **Traceability**: Direct link back to the original meeting

## Data Mapping

| Meeting Field | Coda Column | Description |
|---------------|-------------|-------------|
| `title` | Initiative Title | Prefixed with "Research:" |
| `title` | Source Meeting | Original meeting title |
| `customer` | Customer/Company | Extracted from meeting title |
| `date` | Meeting Date | Meeting date/time |
| `priority` | Priority | Auto-calculated: High/Medium/Low |
| `keyTopics` | Research Topics | Comma-separated topics |
| `summary` | Meeting Summary | Transcript excerpt or summary |
| `actionItems` | Action Items | Semicolon-separated items |
| `sentiment` | Sentiment | positive/neutral/negative |
| `attendees` | Attendees | Formatted participant list |
| `id` | Meeting ID | UUID for traceability |

## API Endpoints

The integration uses these endpoints:

- `POST /api/coda` - Main Coda integration endpoint
  - `action: create_research_initiative` - Create new row
  - `action: test_connection` - Test API connectivity
  - `action: get_table_columns` - Get table structure

## Troubleshooting

### Common Issues:

1. **"CODA_API_TOKEN not configured"**
   - Make sure you added the token to `.env.local`
   - Restart your development server

2. **"Document not found"**
   - Check your document ID is correct
   - Ensure the document is accessible with your API token

3. **"Table not found"**
   - Verify the table ID is correct
   - Make sure the table exists in the specified document

4. **"Failed to create row"**
   - Check that all required columns exist in your table
   - Verify column names match exactly (case-sensitive)

### Testing the Integration:

```bash
# Test connection (replace with your IDs)
curl -X POST http://localhost:3000/api/coda \
  -H "Content-Type: application/json" \
  -d '{
    "action": "test_connection",
    "docId": "your-doc-id",
    "tableId": "your-table-id"
  }'
```

## Security Notes

- API tokens have full access to your Coda account
- Store tokens securely in environment variables
- Never commit API tokens to version control
- Consider using Coda's permission system to limit access

## Benefits

✅ **Streamlined Research**: Convert meetings to actionable research initiatives  
✅ **Centralized Tracking**: All research in one Coda workspace  
✅ **Rich Context**: Meeting details, analysis, and participants included  
✅ **Automatic Prioritization**: Smart priority calculation  
✅ **Full Traceability**: Direct links back to source meetings  

## Next Steps

1. Set up your Coda research table with the recommended columns
2. Generate and configure your API token
3. Test the integration with a sample meeting
4. Customize the column mapping if needed
5. Train your team on the new workflow