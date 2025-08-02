import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase-client';

// Dedicated endpoint for Zapier to fetch user-customized templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const apiKey = searchParams.get('apiKey'); // Optional: for authentication

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId parameter required' },
        { status: 400 }
      );
    }

    // Fetch custom template from database
    const { data: template, error } = await supabase
      .from('slack_templates')
      .select('id, name, message_template, channel, enabled')
      .eq('id', templateId)
      .eq('enabled', true)
      .single();

    if (error || !template) {
      // Return default template if custom not found
      const defaultTemplate = getDefaultTemplate(templateId);
      if (!defaultTemplate) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        template: defaultTemplate,
        isDefault: true
      });
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        message_template: template.message_template,
        channel: template.channel,
        enabled: template.enabled
      },
      isDefault: false
    });

  } catch (error) {
    console.error('Error fetching template for Zapier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// Enhanced POST endpoint for Zapier with template fetching
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, templateData, autoFetchTemplate = true } = body;

    let template;
    let messageTemplate;

    if (autoFetchTemplate && templateId) {
      // Fetch the user's custom template
      const { data: customTemplate } = await supabase
        .from('slack_templates')
        .select('message_template, channel')
        .eq('id', templateId)
        .eq('enabled', true)
        .single();

      if (customTemplate) {
        template = customTemplate;
        messageTemplate = customTemplate.message_template;
      } else {
        // Fallback to default
        const defaultTemplate = getDefaultTemplate(templateId);
        if (defaultTemplate) {
          messageTemplate = defaultTemplate.message_template;
        }
      }
    }

    if (!messageTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Process template with dynamic data
    const processedMessage = processTemplate(messageTemplate, templateData || {});

    // Determine webhook URL based on template or explicit channel
    const webhookUrl = getWebhookForTemplate(templateId, template?.channel);

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'No webhook configured for this template' },
        { status: 400 }
      );
    }

    // Send to Slack
    const slackMessage = {
      text: processedMessage,
      username: 'Content Pipeline Bot',
      icon_emoji: getEmojiForTemplate(templateId)
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      templateUsed: templateId,
      isCustomTemplate: !!template,
      channel: template?.channel || 'default'
    });

  } catch (error) {
    console.error('Error in Zapier Slack endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

function getDefaultTemplate(templateId: string) {
  const defaults = {
    'product-update-notification': {
      id: 'product-update-notification',
      name: 'Product Update Published',
      message_template: `📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}`,
      channel: '#product-updates'
    },
    'approval-request': {
      id: 'approval-request',
      name: 'Content Approval Request',
      message_template: `🔍 **New Content Ready for Review**

**Title:** {contentTitle}
**Type:** {contentType}
**Quality Score:** {qualityScore}%

**Summary:** {contentSummary}

[View Content]({contentUrl}) | [Dashboard]({dashboardUrl})`,
      channel: '#content-approvals'
    }
  };

  return defaults[templateId as keyof typeof defaults] || null;
}

function processTemplate(template: string, data: any): string {
  let processed = template;
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });
  
  return processed;
}

function getWebhookForTemplate(templateId: string, channel?: string) {
  const webhooks = {
    'product-update-notification': process.env.SLACK_WEBHOOK_UPDATES,
    'approval-request': process.env.SLACK_WEBHOOK_APPROVALS,
    'daily-summary': process.env.SLACK_WEBHOOK_CONTENT,
    'customer-insight-alert': process.env.SLACK_WEBHOOK_INSIGHTS
  };

  return webhooks[templateId as keyof typeof webhooks] || process.env.SLACK_WEBHOOK_UPDATES;
}

function getEmojiForTemplate(templateId: string) {
  const emojis = {
    'product-update-notification': ':rocket:',
    'approval-request': ':memo:',
    'daily-summary': ':chart_with_upwards_trend:',
    'customer-insight-alert': ':warning:'
  };

  return emojis[templateId as keyof typeof emojis] || ':robot_face:';
}