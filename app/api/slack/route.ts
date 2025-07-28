import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

// Mock Slack configuration - in production, these would be environment variables
const SLACK_CONFIG = {
  bot_token: process.env.SLACK_BOT_TOKEN || 'mock-bot-token',
  signing_secret: process.env.SLACK_SIGNING_SECRET || 'mock-signing-secret',
  channel_approvals: process.env.SLACK_CHANNEL_APPROVALS || '#content-approvals',
  channel_notifications: process.env.SLACK_CHANNEL_NOTIFICATIONS || '#content-updates',
  webhook_url: process.env.SLACK_WEBHOOK_URL || 'mock-webhook-url'
};

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
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'send_notification':
        return await sendSlackNotification(params);
      case 'approval_request':
        return await sendApprovalRequest(params);
      case 'daily_summary':
        return await sendDailySummary(params);
      case 'handle_command':
        return await handleSlashCommand(params);
      case 'handle_interaction':
        return await handleInteraction(params);
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
    const { message, channel, type = 'info' } = params;
    
    const slackMessage: SlackMessage = {
      text: message,
      channel: channel || SLACK_CONFIG.channel_notifications,
      username: 'Content Pipeline Bot',
      icon_emoji: getEmojiForType(type)
    };

    // Mock Slack API call
    const response = await mockSlackAPICall('chat.postMessage', slackMessage);
    
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
    const { contentId, contentTitle, contentType, qualityScore, reviewerIds = [] } = params;
    
    const approvalMessage = {
      text: `New content ready for approval: ${contentTitle}`,
      channel: SLACK_CONFIG.channel_approvals,
      username: 'Content Pipeline Bot',
      icon_emoji: ':memo:',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 Content Approval Request'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${contentTitle}*\n\nType: ${contentType}\nQuality Score: ${(qualityScore * 100).toFixed(0)}%`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${process.env.NEXT_PUBLIC_BASE_URL}/approval|View in Dashboard> | <${process.env.NEXT_PUBLIC_BASE_URL}/edit/${contentId}|Edit Content>`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '✅ Approve'
              },
              style: 'primary',
              value: `approve_${contentId}`,
              action_id: 'approve_content'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '✏️ Request Changes'
              },
              style: 'danger',
              value: `changes_${contentId}`,
              action_id: 'request_changes'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '❌ Reject'
              },
              value: `reject_${contentId}`,
              action_id: 'reject_content'
            }
          ]
        }
      ]
    };

    const response = await mockSlackAPICall('chat.postMessage', approvalMessage);
    
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
      channel: SLACK_CONFIG.channel_notifications,
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

    const response = await mockSlackAPICall('chat.postMessage', summaryMessage);
    
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

async function handleInteraction(params: any) {
  try {
    const { action_id, value, user } = params;
    
    if (action_id === 'approve_content') {
      const contentId = value.replace('approve_', '');
      await approveContentViaSlack(contentId, user.username);
      return NextResponse.json({
        text: `Content approved by ${user.username}`,
        response_type: 'in_channel'
      });
    }
    
    if (action_id === 'request_changes') {
      const contentId = value.replace('changes_', '');
      await requestChangesViaSlack(contentId, user.username);
      return NextResponse.json({
        text: `Changes requested by ${user.username}`,
        response_type: 'in_channel'
      });
    }
    
    if (action_id === 'reject_content') {
      const contentId = value.replace('reject_', '');
      await rejectContentViaSlack(contentId, user.username);
      return NextResponse.json({
        text: `Content rejected by ${user.username}`,
        response_type: 'in_channel'
      });
    }

    return NextResponse.json({
      text: 'Action completed',
      response_type: 'ephemeral'
    });

  } catch (error) {
    console.error('Error handling interaction:', error);
    return NextResponse.json({
      text: 'Sorry, there was an error processing your action.',
      response_type: 'ephemeral'
    });
  }
}

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

async function approveContentViaSlack(contentId: string, username: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        contentId,
        reviewerId: `slack_${username}`,
        comments: 'Approved via Slack'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to approve content');
    }

    console.log(`Content ${contentId} approved via Slack by ${username}`);

  } catch (error) {
    console.error('Error approving content via Slack:', error);
    throw error;
  }
}

async function requestChangesViaSlack(contentId: string, username: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_changes',
        contentId,
        reviewerId: `slack_${username}`,
        comments: 'Changes requested via Slack'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to request changes');
    }

    console.log(`Changes requested for ${contentId} via Slack by ${username}`);

  } catch (error) {
    console.error('Error requesting changes via Slack:', error);
    throw error;
  }
}

async function rejectContentViaSlack(contentId: string, username: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reject',
        contentId,
        reviewerId: `slack_${username}`,
        comments: 'Rejected via Slack'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to reject content');
    }

    console.log(`Content ${contentId} rejected via Slack by ${username}`);

  } catch (error) {
    console.error('Error rejecting content via Slack:', error);
    throw error;
  }
}

async function mockSlackAPICall(method: string, data: any) {
  // Mock Slack API response
  const mockResponse = {
    ok: true,
    channel: data.channel,
    ts: Date.now().toString(),
    message: {
      text: data.text,
      username: data.username,
      ts: Date.now().toString()
    }
  };

  console.log(`Mock Slack API call: ${method}`, data);
  return mockResponse;
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