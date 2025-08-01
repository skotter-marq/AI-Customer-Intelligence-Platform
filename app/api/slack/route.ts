import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

// Slack webhook configuration
const SLACK_WEBHOOKS = {
  approvals: process.env.SLACK_WEBHOOK_APPROVALS,
  updates: process.env.SLACK_WEBHOOK_UPDATES,
  insights: process.env.SLACK_WEBHOOK_INSIGHTS,
  content: process.env.SLACK_WEBHOOK_CONTENT
};

// Slack webhook URLs loaded from environment variables

interface SlackMessage {
  text: string;
  channel: string;
  username?: string;
  icon_emoji?: string;
  attachments?: any[];
  blocks?: any[];
}

interface SlackCommand {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    // Handle JSON requests (our internal API calls)
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'send_notification':
        return await sendSlackNotification(params);
      case 'approval_request':
        return await sendApprovalRequest(params);
      case 'daily_summary':
        return await sendDailySummary(params);
      case 'test_template':
        return await sendSlackNotification(params);
      case 'handle_command':
        return await handleSlashCommand(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Slack interactive components removed - using direct dashboard links instead

// Handle Slack slash commands
export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const command = searchParams.get('command');
    
    // Mock slash command handling
    if (command === '/content-stats') {
      const statsResponse = await getContentStats();
      return NextResponse.json(statsResponse);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Slack bot is running'
    });

  } catch (error) {
    console.error('Slack GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendSlackNotification(params: any) {
  try {
    const { message, channel, type = 'info', templateId, templateData } = params;
    
    console.log('Slack notification request:', { templateId, type, hasTemplateData: !!templateData });
    
    let slackMessage;
    
    // If templateId is provided, use the configured template
    if (templateId && templateData) {
      const template = await getSlackTemplate(templateId);
      console.log('Template found:', { templateId, hasTemplate: !!template });
      if (template) {
        let processedText = processTemplate(template.message_template, templateData);
        console.log('Processed template text preview:', processedText.substring(0, 100) + '...');
        
        // Validate the processed text
        if (!processedText || processedText.trim().length === 0) {
          console.error('Processed template is empty, using fallback');
          processedText = `🚀 New Update: ${templateData.updateTitle || 'Product Update'}`;
        }
        
        slackMessage = {
          text: processedText
        };
      }
    }
    
    // Auto-detect template based on message content and type
    if (!slackMessage && (message === '/content' || !message || message.trim() === '')) {
      // Default to product update notification if no specific template
      const template = await getSlackTemplate('product-update-notification');
      if (template) {
        const defaultData = {
          updateTitle: 'Product Update',
          jiraKey: 'N/A',
          assignee: 'System',
          updateDescription: 'A new product update has been published',
          customerImpact: 'Check the dashboard for details',
          changelogUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/product`,
          jiraUrl: '#'
        };
        
        slackMessage = {
          text: processTemplate(template.message_template, defaultData)
        };
      }
    }
    
    // Final fallback to simple message
    if (!slackMessage) {
      slackMessage = {
        text: message || 'New notification from Content Pipeline'
      };
    }

    // Determine which webhook to use based on type, templateId, or channel
    let webhookUrl = SLACK_WEBHOOKS.updates; // default
    if (type === 'approval') webhookUrl = SLACK_WEBHOOKS.approvals;
    if (type === 'insight') webhookUrl = SLACK_WEBHOOKS.insights;
    if (channel && channel.includes('content')) webhookUrl = SLACK_WEBHOOKS.content;
    
    // Template-specific routing
    if (templateId === 'slack-jira-story-completed') {
      webhookUrl = SLACK_WEBHOOKS.approvals; // JIRA completions go to approvals channel
    }

    console.log('Using webhook URL:', { 
      type, 
      templateId, 
      webhookUrl: webhookUrl ? 'configured' : 'missing',
      webhookType: webhookUrl === SLACK_WEBHOOKS.approvals ? 'approvals' : 
                   webhookUrl === SLACK_WEBHOOKS.updates ? 'updates' : 
                   webhookUrl === SLACK_WEBHOOKS.insights ? 'insights' : 
                   webhookUrl === SLACK_WEBHOOKS.content ? 'content' : 'unknown'
    });

    // Enable mock mode if webhooks not configured or if SLACK_MOCK_MODE is set
    if (!webhookUrl || process.env.SLACK_MOCK_MODE === 'true') {
      console.log('Using mock mode for Slack notifications');
      return NextResponse.json({
        success: true,
        message: 'Notification sent (mock mode)',
        mockData: slackMessage,
        processedTemplate: slackMessage.text
      });
    }

    const response = await sendToSlackWebhook(webhookUrl, slackMessage);
    
    console.log('Slack notification sent:', slackMessage);
    
    return NextResponse.json({
      success: true,
      message: 'Notification sent to Slack',
      response
    });

  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

async function sendApprovalRequest(params: any) {
  try {
    const { 
      contentId, 
      contentTitle, 
      contentType = 'changelog_entry', 
      contentSummary,
      qualityScore = 85, 
      jiraKey,
      assignee,
      category,
      reviewerIds = [] 
    } = params;
    
    // Create the approval message with direct link to dashboard (no interactive buttons)
    const approvalMessage = {
      text: `📋 Changelog Entry Ready for Review - ${jiraKey || contentTitle}`,
      username: 'Changelog Bot',
      icon_emoji: ':memo:',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 Changelog Review Needed'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${jiraKey || 'Story'}* has been completed and the changelog entry is ready for review.\n\n*Title:* ${contentTitle}\n*Category:* ${category || 'feature_update'}\n*Assignee:* ${assignee || 'Unassigned'}\n*Summary:* ${contentSummary || 'Review the content for details'}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `👉 *<${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval|Review & Approve in Dashboard>*\n\nClick the link above to review, edit, and approve this changelog entry.${jiraKey ? `\n\n🎫 <https://marq.atlassian.net/browse/${jiraKey}|View JIRA Ticket>` : ''}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Quality Score: ${qualityScore}% | Content ID: ${contentId}`
            }
          ]
        }
      ]
    };

    const response = await sendToSlackWebhook(SLACK_WEBHOOKS.approvals, approvalMessage);
    
    console.log('Approval request sent to Slack:', approvalMessage);
    
    return NextResponse.json({
      success: true,
      message: 'Approval request sent to Slack',
      response
    });

  } catch (error) {
    console.error('Error sending approval request:', error);
    return NextResponse.json(
      { error: 'Failed to send approval request' },
      { status: 500 }
    );
  }
}

async function sendDailySummary(params: any) {
  try {
    // Get daily stats from database
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const { data: todayStats } = await supabase
      .from('generated_content')
      .select('*')
      .gte('created_at', yesterday.toISOString());

    const stats = {
      total_generated: todayStats?.length || 0,
      pending_approval: todayStats?.filter(c => c.approval_status === 'pending').length || 0,
      approved: todayStats?.filter(c => c.approval_status === 'approved').length || 0,
      published: todayStats?.filter(c => c.status === 'published').length || 0,
      avg_quality: todayStats?.reduce((sum, c) => sum + (c.quality_score || 0), 0) / (todayStats?.length || 1) || 0
    };

    const summaryMessage = {
      text: 'Daily Content Pipeline Summary',
      username: 'Content Pipeline Bot',
      icon_emoji: ':chart_with_upwards_trend:',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Daily Content Summary'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Content Generated Today: ${stats.total_generated}*\n\n` +
                  `• Pending Approval: ${stats.pending_approval}\n` +
                  `• Approved: ${stats.approved}\n` +
                  `• Published: ${stats.published}\n` +
                  `• Average Quality: ${(stats.avg_quality * 100).toFixed(1)}%`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📋 View Dashboard'
              },
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/approval`,
              action_id: 'view_dashboard'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📈 View Analytics'
              },
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
              action_id: 'view_analytics'
            }
          ]
        }
      ]
    };

    const response = await sendToSlackWebhook(SLACK_WEBHOOKS.content, summaryMessage);
    
    console.log('Daily summary sent to Slack:', summaryMessage);
    
    return NextResponse.json({
      success: true,
      message: 'Daily summary sent to Slack',
      stats,
      response
    });

  } catch (error) {
    console.error('Error sending daily summary:', error);
    return NextResponse.json(
      { error: 'Failed to send daily summary' },
      { status: 500 }
    );
  }
}

async function handleSlashCommand(params: SlackCommand) {
  try {
    const { command, text, user_name, channel_name } = params;
    
    let response;
    
    switch (command) {
      case '/content-stats':
        response = await getContentStats();
        break;
      case '/content-pending':
        response = await getPendingContent();
        break;
      case '/content-help':
        response = getHelpMessage();
        break;
      default:
        response = {
          text: `Unknown command: ${command}. Use /content-help for available commands.`,
          response_type: 'ephemeral'
        };
    }

    console.log(`Slash command ${command} executed by ${user_name} in #${channel_name}`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error handling slash command:', error);
    return NextResponse.json({
      text: 'Sorry, there was an error processing your command.',
      response_type: 'ephemeral'
    });
  }
}

// Interactive button handling removed - using dashboard links instead

async function getContentStats() {
  try {
    const { data: content } = await supabase
      .from('generated_content')
      .select('*');

    const stats = {
      total: content?.length || 0,
      pending: content?.filter(c => c.approval_status === 'pending').length || 0,
      approved: content?.filter(c => c.approval_status === 'approved').length || 0,
      published: content?.filter(c => c.status === 'published').length || 0
    };

    return {
      text: `📊 Content Pipeline Stats:\n• Total: ${stats.total}\n• Pending: ${stats.pending}\n• Approved: ${stats.approved}\n• Published: ${stats.published}`,
      response_type: 'in_channel'
    };

  } catch (error) {
    console.error('Error getting content stats:', error);
    return {
      text: 'Sorry, could not retrieve content statistics.',
      response_type: 'ephemeral'
    };
  }
}

async function getPendingContent() {
  try {
    const { data: pending } = await supabase
      .from('generated_content')
      .select('id, content_title, content_type, quality_score')
      .eq('approval_status', 'pending')
      .limit(5);

    if (!pending || pending.length === 0) {
      return {
        text: '✅ No content pending approval!',
        response_type: 'in_channel'
      };
    }

    const pendingList = pending.map(item => 
      `• ${item.content_title} (${item.content_type}) - Quality: ${(item.quality_score * 100).toFixed(0)}%`
    ).join('\n');

    return {
      text: `📋 Content Pending Approval:\n${pendingList}\n\n<${process.env.NEXT_PUBLIC_BASE_URL}/approval|View All>`,
      response_type: 'in_channel'
    };

  } catch (error) {
    console.error('Error getting pending content:', error);
    return {
      text: 'Sorry, could not retrieve pending content.',
      response_type: 'ephemeral'
    };
  }
}

function getHelpMessage() {
  return {
    text: `🤖 Content Pipeline Bot Commands:\n\n` +
          `• \`/content-stats\` - Show pipeline statistics\n` +
          `• \`/content-pending\` - List pending approvals\n` +
          `• \`/content-help\` - Show this help message\n\n` +
          `<${process.env.NEXT_PUBLIC_BASE_URL}/approval|Open Dashboard>`,
    response_type: 'ephemeral'
  };
}

// Slack interaction functions removed - users now go directly to dashboard for approvals

async function sendToSlackWebhook(webhookUrl: string, message: any) {
  try {
    if (!webhookUrl || webhookUrl === 'mock-webhook-url' || webhookUrl.includes('undefined')) {
      console.log('Mock Slack webhook call (no valid webhook URL):', message);
      return {
        ok: true,
        ts: Date.now().toString(),
        message: message,
        mock: true
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack webhook error details:', {
        status: response.status,
        statusText: response.statusText,
        url: webhookUrl.substring(0, 50) + '...',
        responseText: errorText,
        sentMessage: JSON.stringify(message, null, 2)
      });
      
      // If webhook is invalid (404 no_service), fall back to mock mode
      if (response.status === 404 && errorText === 'no_service') {
        console.warn('⚠️ Slack webhook URL is invalid, falling back to mock mode');
        return {
          ok: true,
          ts: Date.now().toString(),
          message: message,
          mock: true,
          error: 'Webhook URL invalid - using mock mode'
        };
      }
      
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.text();
    console.log('Slack webhook sent successfully:', { message: message.text, channel: message.channel });
    
    return {
      ok: true,
      ts: Date.now().toString(),
      response: result
    };

  } catch (error) {
    console.error('Error sending to Slack webhook:', error);
    
    // Fall back to mock mode for any webhook errors to prevent workflow failures
    console.warn('⚠️ Falling back to mock mode due to webhook error');
    return {
      ok: true,
      ts: Date.now().toString(),
      message: message,
      mock: true,
      error: error.message
    };
  }
}

async function getSlackTemplate(templateId: string) {
  try {
    // First, try to fetch custom template from database
    const { data: customTemplate } = await supabase
      .from('slack_templates')
      .select('*')
      .eq('id', templateId)
      .eq('enabled', true)
      .single();

    if (customTemplate) {
      return customTemplate;
    }
  } catch (error) {
    console.log('No custom template found, using default:', templateId);
  }

  // Fallback to default templates
  const defaultTemplates = {
    'approval-request': {
      message_template: `🔍 **New Content Ready for Review**

**Title:** {contentTitle}
**Type:** {contentType}
**Quality Score:** {qualityScore}%

**Summary:** {contentSummary}

**Next Steps:**
• Review content in dashboard
• Approve or request changes
• Content will auto-publish upon approval

[View Content]({contentUrl}) | [Dashboard]({dashboardUrl})`
    },
    'product-update-notification': {
      message_template: `🚀 **New Product Update Published**

**Feature:** {updateTitle}
**JIRA Ticket:** {jiraKey}
**Completed by:** {assignee}

**What Changed:**
{updateDescription}

**Customer Impact:**
{customerImpact}{mediaResources}`
    },
    'slack-jira-story-completed': {
      message_template: `🎉 **JIRA Story Completed - Ready for Changelog Review**

**Story:** {jiraKey} - {storyTitle}
**Assignee:** {assignee}
**Priority:** {priority}
**Category:** {category}

**Customer-Facing Title:**
{customerTitle}

**Description:**
{customerDescription}

**Affected Users:** ~{affectedUsers}

**Next Steps:**
• Review the generated changelog entry
• Approve for publication
• Make any necessary edits

[View in Dashboard]({dashboardUrl}) | [JIRA Ticket]({jiraUrl}) | [Edit Entry]({editUrl})`
    },
    'changelog-approval-request': {
      message_template: `📋 **Changelog Entry Ready for Review**

**{jiraKey}** has been completed and needs changelog approval.

**Title:** {contentTitle}
**Category:** {category} 
**Summary:** {contentSummary}

Quick approve, request changes, or reject below:`
    },
    'daily-summary': {
      message_template: `📊 **Daily Content Pipeline Summary**

**Today's Activity:**
• Content Generated: {totalGenerated}
• Pending Approval: {pendingApproval}
• Published: {published}
• Average Quality: {avgQuality}%

**JIRA Updates:**
• New Customer Stories: {newStories}
• Completed Features: {completedFeatures}

[View Dashboard]({dashboardUrl})`
    },
    'customer-insight-alert': {
      message_template: `🚨 **High-Priority Customer Insight Detected**

**Customer:** {customerName}
**Meeting:** {meetingTitle}
**Priority Score:** {priorityScore}/10

**Key Insight:**
> {insightSummary}

**Recommended Actions:**
{actionItems}

[View Full Analysis]({meetingUrl}) | [Create JIRA Ticket]({jiraCreateUrl})`
    }
  };
  
  return defaultTemplates[templateId as keyof typeof defaultTemplates] || null;
}

function processTemplate(template: string, data: any): string {
  let processed = template;
  
  // Replace all template variables with actual data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    const cleanValue = value ? String(value).trim() : `[${key} not provided]`;
    processed = processed.replace(regex, cleanValue);
  });
  
  // Clean up any remaining unreplaced variables
  processed = processed.replace(/\{[^}]+\}/g, '[missing data]');
  
  // Remove any excessive whitespace/newlines that might cause issues
  processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n'); // max 2 consecutive newlines
  
  return processed;
}

function getEmojiForType(type: string) {
  const emojiMap: { [key: string]: string } = {
    'info': ':information_source:',
    'success': ':white_check_mark:',
    'warning': ':warning:',
    'error': ':x:',
    'approval': ':memo:',
    'publish': ':rocket:'
  };
  
  return emojiMap[type] || ':robot_face:';
}