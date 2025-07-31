# Approval Dashboard Redesign Plan

## Current Issues:
1. Visibility toggle causing API errors ✅ FIXED
2. Impacted Users section not needed
3. Cards need more JIRA context
4. Should match competitors list view design

## Available JIRA Data:
- jira_story_key: "PRESS-21536"
- jira_issue_id: "54886"  
- priority: "medium"
- components: []
- source: "jira_webhook"
- ai_provider: "claude"
- webhook_timestamp: processing time
- update_category: "improved"
- quality_score: 0.85

## Redesign Features:
1. **List View Format** (like competitors page)
   - Clean list items with expand/collapse
   - Hover effects and transitions
   - Consistent card styling

2. **Enhanced JIRA Context**
   - Show JIRA story key prominently
   - Display priority with color coding
   - Show processing timestamp
   - Add direct JIRA link

3. **Streamlined Content**
   - Remove impacted users
   - Focus on title, description, JIRA key
   - Clean approve/reject actions

4. **Better UX**
   - Expandable details
   - Inline editing preserved
   - Bulk actions in header