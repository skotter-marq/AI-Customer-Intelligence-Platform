-- Comprehensive seed data for all prompts and templates in the application
-- This file contains ALL prompts, templates, and messages currently hardcoded in the system

-- Clear existing data (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE ai_prompts CASCADE;
-- TRUNCATE TABLE slack_templates CASCADE;
-- TRUNCATE TABLE email_templates CASCADE;
-- TRUNCATE TABLE system_messages CASCADE;

-- ============================================================================
-- AI PROMPTS
-- ============================================================================

INSERT INTO ai_prompts (id, name, description, category, type, system_instructions, user_prompt_template, variables, parameters, used_in, version, enabled) VALUES

-- Meeting Analysis Prompts
('meeting-analysis', 'Meeting Transcript Analysis', 'Extracts customer insights, pain points, and opportunities from meeting transcripts', 'Meeting Analysis', 'ai_analysis', 
'You are an expert customer intelligence analyst focused on extracting actionable business insights from meeting conversations.',
'You are an expert customer intelligence analyst. Analyze the following meeting transcript and extract key insights.

MEETING CONTEXT:
- Company: {company}
- Meeting Type: {meetingType}
- Date: {date}
- Participants: {participants}

TRANSCRIPT:
{transcript}

ANALYSIS INSTRUCTIONS:
Please analyze this transcript and provide insights in the following JSON format:

{
  "insights": [
    {
      "type": "pain_point|feature_request|sentiment|opportunity|risk",
      "title": "Brief descriptive title",
      "description": "Detailed description of the insight",
      "sentiment_score": -1.0 to 1.0,
      "confidence_score": 0.0 to 1.0,
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2", "tag3"],
      "quotes": ["relevant quote from transcript"]
    }
  ],
  "overall_sentiment": -1.0 to 1.0,
  "key_topics": ["topic1", "topic2", "topic3"],
  "recommended_actions": [
    {
      "action": "Brief action description",
      "priority": "high|medium|low",
      "owner": "suggested team/person",
      "timeline": "immediate|short_term|long_term"
    }
  ],
  "summary": "Brief 2-3 sentence summary of the meeting and key takeaways"
}',
'["company", "meetingType", "date", "participants", "transcript"]'::jsonb,
'{"temperature": 0.3, "maxTokens": 2000, "model": "claude-3-5-sonnet-20241022"}'::jsonb,
'["Grain webhook processing", "Manual meeting analysis", "Customer insight extraction"]'::jsonb,
'2.1', true),

-- Changelog Generation Prompts  
('changelog-generation', 'JIRA Changelog Generation', 'Transforms JIRA tickets into customer-friendly changelog entries for product updates', 'Content Generation', 'ai_analysis',
'You are an expert technical writer who specializes in creating customer-facing product update communications.',
'Transform this JIRA ticket into a customer-friendly changelog entry.

JIRA TICKET DETAILS:
- Key: {jiraKey}
- Title: {title}
- Description: {description}
- Status: {status}
- Priority: {priority}
- Components: {components}
- Labels: {labels}
- Assignee: {assignee}

REQUIREMENTS:
Create a changelog entry with the following structure:

{
  "customer_title": "Customer-facing title (concise, benefit-focused)",
  "customer_description": "2-3 sentences explaining what changed and why customers should care",
  "highlights": ["Key benefit 1", "Key benefit 2", "Key benefit 3"],
  "breaking_changes": false,
  "migration_notes": "If applicable, what customers need to do",
  "affected_users": "all|enterprise|specific_plan|beta_users",
  "category": "feature_update|bug_fix|performance_improvement|security_update",
  "importance_score": 0.0 to 1.0,
  "customer_impact": "Brief description of how this affects customer workflow"
}

Focus on benefits, not technical implementation details.',
'["jiraKey", "title", "description", "status", "priority", "components", "labels", "assignee"]'::jsonb,
'{"temperature": 0.2, "maxTokens": 1000, "model": "claude-3-5-sonnet-20241022"}'::jsonb,
'["JIRA webhook automation", "Manual changelog creation", "Product update workflows"]'::jsonb,
'2.0', true);

-- ============================================================================
-- SLACK TEMPLATES
-- ============================================================================

INSERT INTO slack_templates (id, name, description, category, channel, message_template, variables, trigger_event, webhook_type, enabled) VALUES

-- Product Update Notifications
('product-update-notification', 'Product Update Published', 'Slack notification sent when product updates are published via JIRA webhooks', 'notification', '#int-product-updates',
'📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}',
'["updateTitle", "updateDescription", "whatsNewSection", "mediaResources"]'::jsonb,
'product_update_published', 'updates', true),

-- Approval Request Messages
('approval-request', 'Content Approval Request', 'Message for requesting approval on changelog entries', 'approval', '#product-changelog-approvals',
'📋 **Changelog Entry Ready for Review**

**{jiraKey}** has been completed and needs changelog approval.

**Title:** {contentTitle}
**Category:** {category}
**Summary:** {contentSummary}

👉 **Review & Approve in Dashboard**

Click the link above to review, edit, and approve this changelog entry.',
'["jiraKey", "contentTitle", "category", "contentSummary", "qualityScore", "contentId"]'::jsonb,
'changelog_approval_needed', 'approvals', true),

-- JIRA Story Completed
('jira-story-completed', 'JIRA Story Completed', 'Notification when a customer-facing JIRA story is completed and changelog entry is generated', 'notification', '#product-changelog-approvals',
'**{jiraKey}** has been completed and the changelog entry is ready for review.

**Title:** {contentTitle}
**Category:** {category}  
**Assignee:** {assignee}
**Summary:** {contentSummary}

👉 **Review & Approve in Dashboard**

Click the link above to review, edit, and approve this changelog entry.

🎫 View JIRA Ticket

Quality Score: {qualityScore}% | Content ID: [generated]',
'["jiraKey", "contentTitle", "category", "contentSummary", "assignee", "qualityScore"]'::jsonb,
'jira_story_completed', 'approvals', true),

-- Daily Summary
('daily-summary', 'Daily Pipeline Summary', 'Daily summary of content pipeline activity', 'summary', '#product-updates',
'📊 **Daily Content Pipeline Summary**

**Today''s Activity:**
• Content Generated: {totalGenerated}
• Pending Approval: {pendingApproval}
• Published: {published}
• Average Quality: {avgQuality}%

**JIRA Updates:**
• New Customer Stories: {newStories}
• Completed Features: {completedFeatures}

[View Dashboard]({dashboardUrl})',
'["totalGenerated", "pendingApproval", "published", "avgQuality", "newStories", "completedFeatures", "dashboardUrl"]'::jsonb,
'daily_summary_requested', 'content', true),

-- Customer Insight Alert
('customer-insight-alert', 'High-Priority Customer Insight Alert', 'Slack alert for important customer insights detected from meeting analysis', 'alert', '#product-meeting-insights',
'🚨 **High-Priority Customer Insight Detected**

**Customer:** {customerName}
**Meeting:** {meetingTitle}
**Priority Score:** {priorityScore}/10

**Key Insight:**
> {insightSummary}

**Recommended Actions:**
{actionItems}

[View Full Analysis]({meetingUrl}) | [Create JIRA Ticket]({jiraCreateUrl})',
'["customerName", "meetingTitle", "priorityScore", "insightSummary", "actionItems", "meetingUrl", "jiraCreateUrl"]'::jsonb,
'high_priority_insight', 'insights', true);

-- ============================================================================
-- SYSTEM MESSAGES
-- ============================================================================

INSERT INTO system_messages (id, name, description, category, message_template, variables, context, enabled) VALUES

-- API Response Messages
('api-success-general', 'General API Success', 'Generic success message for API responses', 'success', 'Operation completed successfully', '[]'::jsonb, 'api_response', true),
('api-error-general', 'General API Error', 'Generic error message for API failures', 'error', 'An error occurred while processing your request', '[]'::jsonb, 'api_response', true),
('api-error-database', 'Database Connection Error', 'Error when database is unavailable', 'error', 'Database connection not available', '[]'::jsonb, 'api_response', true),
('api-error-validation', 'Validation Error', 'Error for invalid input data', 'error', 'Invalid input data: {details}', '["details"]'::jsonb, 'api_response', true),

-- Approval Messages
('approval-success', 'Approval Success', 'Message when content is successfully approved', 'success', 'Changelog entry approved and published successfully! JIRA issue {jiraKey} has been updated with the TL;DR in real-time.', '["jiraKey"]'::jsonb, 'ui_alert', true),
('approval-error', 'Approval Error', 'Message when approval fails', 'error', 'Failed to approve entry. Please try again.', '[]'::jsonb, 'ui_alert', true),
('approval-jira-error', 'JIRA Update Error', 'Message when JIRA update fails during approval', 'warning', 'Changelog approved successfully! However, JIRA update failed: {error}. You may need to update JIRA manually.', '["error"]'::jsonb, 'ui_alert', true),

-- Content Generation Messages
('content-generation-success', 'Content Generation Success', 'Message when AI content generation succeeds', 'success', 'Content generated successfully with quality score of {qualityScore}%', '["qualityScore"]'::jsonb, 'ui_alert', true),
('content-generation-error', 'Content Generation Error', 'Message when AI content generation fails', 'error', 'Failed to generate content: {error}', '["error"]'::jsonb, 'ui_alert', true),

-- Webhook Messages
('webhook-received', 'Webhook Received', 'Log message when webhook is received', 'info', 'Received {webhookType} webhook from {source}', '["webhookType", "source"]'::jsonb, 'log_message', true),
('webhook-processed', 'Webhook Processed', 'Log message when webhook is successfully processed', 'success', 'Successfully processed {webhookType} webhook: {summary}', '["webhookType", "summary"]'::jsonb, 'log_message', true),
('webhook-error', 'Webhook Error', 'Log message when webhook processing fails', 'error', 'Failed to process {webhookType} webhook: {error}', '["webhookType", "error"]'::jsonb, 'log_message', true),

-- User Interface Messages
('ui-loading', 'Loading Message', 'Message shown while content is loading', 'info', 'Loading {content}...', '["content"]'::jsonb, 'ui_message', true),
('ui-empty-state', 'Empty State Message', 'Message shown when no data is available', 'info', 'No {itemType} found. {actionSuggestion}', '["itemType", "actionSuggestion"]'::jsonb, 'ui_message', true),
('ui-confirmation', 'Confirmation Message', 'Generic confirmation message', 'info', 'Are you sure you want to {action}? This action cannot be undone.', '["action"]'::jsonb, 'ui_message', true);

-- Update usage counts and last used timestamps for active templates
UPDATE slack_templates SET usage_count = 445, last_used_at = NOW() WHERE id = 'product-update-notification';
UPDATE slack_templates SET usage_count = 234, last_used_at = NOW() WHERE id = 'approval-request';
UPDATE slack_templates SET usage_count = 89, last_used_at = NOW() WHERE id = 'jira-story-completed';
UPDATE slack_templates SET usage_count = 30, last_used_at = NOW() WHERE id = 'daily-summary';
UPDATE slack_templates SET usage_count = 178, last_used_at = NOW() WHERE id = 'customer-insight-alert';

UPDATE ai_prompts SET usage_count = 347, last_used_at = NOW() WHERE id = 'meeting-analysis';
UPDATE ai_prompts SET usage_count = 156, last_used_at = NOW() WHERE id = 'changelog-generation';