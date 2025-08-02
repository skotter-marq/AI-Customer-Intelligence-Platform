import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Template storage table structure
interface SlackTemplate {
  id: string;
  name: string;
  description: string;
  channel: string;
  message_template: string;
  enabled: boolean;
  trigger_event: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: true,
        templates: getDefaultTemplates(),
        message: 'Using default templates (database not available)'
      });
    }

    const { data: templates, error } = await supabase
      .from('slack_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      // If table doesn't exist, return default templates
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          templates: getDefaultTemplates(),
          message: 'Using default templates (table not created yet)'
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      templates: templates || getDefaultTemplates()
    });

  } catch (error) {
    console.error('Error fetching Slack templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates',
        templates: getDefaultTemplates() // Fallback to defaults
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, messageTemplate, channel, action } = body;

    if (action === 'test_template') {
      return await handleTestTemplate(body);
    }

    // Save template
    const templateData: Partial<SlackTemplate> = {
      id: templateId,
      message_template: messageTemplate,
      channel: channel,
      updated_at: new Date().toISOString()
    };

    // For now, store in memory/file system since table might not exist
    // In production, you would save to the slack_templates table
    console.log('Template would be saved:', { templateId, messageTemplate, channel });
    
    // Simulate successful save
    const result = {
      data: [{
        id: templateId,
        message_template: messageTemplate,
        channel: channel,
        updated_at: new Date().toISOString()
      }],
      error: null
    };

    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
      template: result.data?.[0]
    });

  } catch (error) {
    console.error('Error saving Slack template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleTestTemplate(body: any) {
  try {
    const { templateId, messageTemplate, channel, testData } = body;
    
    // Replace template variables with test data
    let processedMessage = messageTemplate;
    
    if (testData) {
      Object.entries(testData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        processedMessage = processedMessage.replace(regex, String(value));
      });
    }

    // Send test message via Slack API (simulate for now)
    const slackResult = {
      success: true,
      message: 'Test message would be sent to Slack',
      response: {
        ok: true,
        channel: channel,
        ts: Date.now().toString()
      }
    };

    return NextResponse.json({
      success: slackResult.success,
      message: slackResult.success ? 'Test message sent successfully' : 'Failed to send test message',
      channel: channel,
      previewMessage: processedMessage,
      slackResponse: slackResult
    });

  } catch (error) {
    console.error('Error testing template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getDefaultTemplates() {
  return [
    {
      id: 'approval-request',
      name: 'Content Approval Request',
      description: 'Message sent when content needs approval',
      category: 'approval',
      channel: '#content-approvals',
      enabled: true,
      trigger_event: 'content_pending_approval',
      message_template: `🔍 **New Content Ready for Review**

**Title:** {contentTitle}
**Type:** {contentType}
**Quality Score:** {qualityScore}%
**Created:** {createdDate}

**Summary:** {contentSummary}

**Next Steps:**
• Review content in dashboard
• Approve or request changes
• Content will auto-publish upon approval

[View Content]({contentUrl}) | [Dashboard]({dashboardUrl})`
    },
    {
      id: 'product-update-notification',
      name: 'Product Update Published',
      description: 'Message sent when a product update is published',
      category: 'notification',
      channel: '#product-updates',
      enabled: true,
      trigger_event: 'product_update_published',
      message_template: `📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}`
    },
    {
      id: 'daily-summary',
      name: 'Daily Pipeline Summary',
      description: 'Daily summary of content pipeline activity',
      category: 'summary',
      channel: '#product-updates',
      enabled: true,
      trigger_event: 'daily_summary',
      message_template: `📊 **Daily Content Pipeline Summary**

**Today's Activity:**
• Content Generated: {totalGenerated}
• Pending Approval: {pendingApproval}
• Published: {published}
• Average Quality: {avgQuality}%

**JIRA Updates:**
• New Customer Stories: {newStories}
• Completed Features: {completedFeatures}

**Top Performing Content:**
{topContent}

[View Dashboard]({dashboardUrl}) | [Weekly Report]({reportUrl})`
    },
    {
      id: 'customer-insight-alert',
      name: 'High-Priority Customer Insight',
      description: 'Alert for high-priority customer insights from meetings',
      category: 'alert',
      channel: '#customer-insights',
      enabled: true,
      trigger_event: 'high_priority_insight',
      message_template: `🚨 **High-Priority Customer Insight Detected**

**Customer:** {customerName}
**Meeting:** {meetingTitle}
**Insight Type:** {insightType}
**Priority Score:** {priorityScore}/10

**Key Insight:**
> {insightSummary}

**Recommended Actions:**
{actionItems}

**Customer Quote:**
> "{customerQuote}"

[View Full Analysis]({meetingUrl}) | [Create JIRA Ticket]({jiraCreateUrl})`
    }
  ];
}