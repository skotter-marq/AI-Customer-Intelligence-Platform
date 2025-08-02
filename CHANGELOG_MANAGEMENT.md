# Changelog Management Guide

This guide explains how to manage changelog entries and make them visible in the public changelog.

## Current Status

✅ **Working**: 3 entries are currently visible in the public changelog  
📊 **Total**: 31 changelog entries in the database  
🔧 **Schema**: Basic functionality works, some advanced features need schema updates

## Quick Access

### Admin Interfaces
- **Public Changelog Management**: `/admin/public-changelog`
- **Content Approval**: `/approval` 
- **Content Editing**: `/edit/{entry-id}`
- **Main Admin Dashboard**: `/admin`

### Public API Endpoints
- **All entries**: `/api/public-changelog`
- **Recent (30 days)**: `/api/public-changelog?timeframe=30d`
- **Limited results**: `/api/public-changelog?limit=5`
- **RSS feed**: `/api/public-changelog?format=rss`

## How Entries Become Public

For an entry to appear in the public changelog, it must meet these criteria:

1. ✅ `content_type = 'changelog_entry'`
2. ✅ `is_public = true`
3. ✅ `public_changelog_visible = true`  
4. ✅ `release_date` is not null

## Managing Public Visibility

### Method 1: Admin Interface (Recommended)
1. Visit `/admin/public-changelog`
2. Use "Make Public" button to enable public visibility
3. Use "Hide from Changelog" to hide public entries
4. Edit entries directly with "Edit" button

### Method 2: Scripts
```bash
# Check current status
node changelog-summary.js

# Make qualified entries public
node make-entries-public-basic.js

# Test API functionality
node test-public-api.js

# Check what's currently public
node check-public-entries-final.js
```

### Method 3: Direct Database Updates
Update entries via Supabase dashboard:
```sql
-- Make an entry public
UPDATE generated_content 
SET 
  is_public = true,
  public_changelog_visible = true,
  release_date = NOW(),
  version = 'v2025.08.1'
WHERE id = 'your-entry-id';

-- Hide an entry from public changelog
UPDATE generated_content 
SET public_changelog_visible = false
WHERE id = 'your-entry-id';
```

## Current Public Entries

These entries are currently visible in the public changelog:

1. **Enhanced Slack notification system for better communication flow**
   - Release Date: 2025-08-02
   - Version: v2025.08.1
   - Category: Improved

2. **Improved Slack notifications for important updates**
   - Release Date: 2025-08-01  
   - Version: v2025.08.1
   - Category: Improved

3. **Improved Slack messaging notifications**
   - Release Date: 2025-08-01
   - Version: v2025.08.1
   - Category: Improved

## Workflow for New Entries

1. **Create Entry**: JIRA webhook automatically creates entries
2. **Review Quality**: Check entry quality via `/approval`
3. **Edit if Needed**: Improve content via `/edit/{id}`
4. **Make Public**: Enable public visibility via `/admin/public-changelog`
5. **Verify**: Check public API to confirm visibility

## Database Schema

### Current Working Fields
- `content_title` - Entry title
- `generated_content` - Main content
- `is_public` - Whether entry is public
- `public_changelog_visible` - Whether shown in changelog
- `release_date` - When entry was released
- `version` - Version number
- `quality_score` - Content quality (0-1)
- `status` - Entry status (draft/published)

### Missing Fields (For Enhanced Functionality)
These fields exist in some code but not in the current database:
- `approval_status` - Approval workflow status
- `update_category` - Type of update (added/fixed/improved/security)
- `tldr_bullet_points` - Highlight bullet points
- `breaking_changes` - Whether update has breaking changes
- `migration_notes` - Migration instructions

### Adding Missing Fields
Run this in Supabase SQL Editor to add missing fields:
```sql
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS update_category TEXT;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS tldr_bullet_points TEXT[] DEFAULT '{}';

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS breaking_changes BOOLEAN DEFAULT false;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS migration_notes TEXT;
```

## API Response Format

The public changelog API returns entries in this format:

```json
{
  "success": true,
  "changelog": [
    {
      "id": "entry-id",
      "version": "v2025.08.1",
      "release_date": "2025-08-02T02:43:28.537983+00:00",
      "category": "Improved",
      "customer_facing_title": "Entry Title",
      "customer_facing_description": "Entry description...",
      "highlights": [],
      "breaking_changes": false,
      "view_count": 1090,
      "upvotes": 42,
      "feedback_count": 11
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 3,
    "hasMore": false
  },
  "metadata": {
    "categories": ["Added", "Fixed", "Improved", "Deprecated", "Security"],
    "totalPublishedVersions": 3,
    "lastUpdated": "2025-08-02T15:54:08.073Z",
    "apiVersion": "1.0",
    "usingFallbackData": false
  }
}
```

## Troubleshooting

### No Entries Showing in Public API
1. Check if entries meet all criteria (see "How Entries Become Public")
2. Verify `release_date` is not null
3. Run `node check-public-entries-final.js` to debug

### API Returns Mock Data
1. Check if database connection is working
2. Verify environment variables are set
3. Look for error messages in API logs

### Admin Interface Not Working
1. Check if `/api/admin/public-changelog` endpoint is accessible
2. Verify Supabase service role key is configured
3. Check browser console for JavaScript errors

## Support Scripts

All scripts are located in the project root:

- `changelog-summary.js` - Complete status overview
- `check-public-entries-final.js` - Check what's currently public
- `make-entries-public-basic.js` - Make approved entries public
- `test-public-api.js` - Test API functionality
- `add-missing-fields.js` - Mark entries as approved
- `fix-approval-status.js` - Add approval status (needs schema update)

## Integration Examples

### Frontend Integration
```javascript
// Fetch public changelog
const response = await fetch('/api/public-changelog?limit=10');
const data = await response.json();
console.log(data.changelog); // Array of entries
```

### RSS Feed Integration
```html
<!-- Add to HTML head -->
<link rel="alternate" type="application/rss+xml" 
      title="Product Changelog" 
      href="/api/public-changelog?format=rss">
```

### Category Filtering
```javascript
// Get only bug fixes (when update_category is added)
const fixes = await fetch('/api/public-changelog?category=fixed');
```

---

**Last Updated**: August 2, 2025  
**Status**: ✅ Functional with 3 public entries