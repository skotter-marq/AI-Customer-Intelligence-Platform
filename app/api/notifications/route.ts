import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface NotificationRequest {
  action: 'send' | 'configure' | 'get_preferences' | 'update_preferences' | 'get_history' | 'test_channel';
  type?: 'approval_request' | 'content_published' | 'content_rejected' | 'system_alert' | 'daily_summary';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  recipients?: string[];
  channels?: string[];
  message?: {
    subject: string;
    body: string;
    data?: any;
  };
  userId?: string;
  preferences?: NotificationPreferences;
  channelType?: 'email' | 'slack' | 'webhook' | 'sms' | 'in_app';
}

interface NotificationPreferences {
  userId: string;
  email_enabled: boolean;
  slack_enabled: boolean;
  webhook_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  notification_types: {
    approval_request: boolean;
    content_published: boolean;
    content_rejected: boolean;
    system_alert: boolean;
    daily_summary: boolean;
  };
  priority_threshold: 'low' | 'medium' | 'high' | 'urgent';
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
}

interface NotificationRoute {
  type: string;
  priority: string;
  channels: string[];
  template: string;
  conditions: any[];
}

export async function POST(request: Request) {
  try {
    const body: NotificationRequest = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'send':
        return await sendNotification(params);
      case 'configure':
        return await configureNotifications(params);
      case 'get_preferences':
        return await getNotificationPreferences(params.userId!);
      case 'update_preferences':
        return await updateNotificationPreferences(params.userId!, params.preferences!);
      case 'get_history':
        return await getNotificationHistory(params.userId);
      case 'test_channel':
        return await testNotificationChannel(params.channelType!, params.userId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type') || 'all';
    
    if (type === 'routes') {
      return await getNotificationRoutes();
    }
    
    if (type === 'stats') {
      return await getNotificationStats(userId || undefined);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification routing system is active',
      channels: ['email', 'slack', 'webhook', 'sms', 'in_app'],
      routes: await getActiveRoutes()
    });

  } catch (error) {
    console.error('Notification GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendNotification(params: Omit<NotificationRequest, 'action'>) {
  try {
    const { type, priority, recipients, channels, message } = params;
    
    if (!type || !message) {
      return NextResponse.json(
        { error: 'Notification type and message are required' },
        { status: 400 }
      );
    }

    // Get notification routes for this type and priority
    const routes = await getRoutesForNotification(type, priority || 'medium');
    
    // Get recipient preferences
    const recipientPreferences = await getRecipientsPreferences(recipients || []);
    
    // Route notification based on rules
    const routingResults = await routeNotification({
      type,
      priority: priority || 'medium',
      message,
      routes,
      recipientPreferences
    });

    // Log notification
    await logNotification({
      type,
      priority: priority || 'medium',
      recipients: recipients || [],
      channels: routingResults.channels_used,
      message: message.subject,
      status: routingResults.success ? 'sent' : 'failed',
      results: routingResults.results
    });

    return NextResponse.json({
      success: routingResults.success,
      message: 'Notification routed successfully',
      channels_used: routingResults.channels_used,
      recipients_reached: routingResults.recipients_reached,
      results: routingResults.results
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

async function routeNotification(params: {
  type: string;
  priority: string;
  message: any;
  routes: NotificationRoute[];
  recipientPreferences: NotificationPreferences[];
}) {
  const { type, priority, message, routes, recipientPreferences } = params;
  
  const results = {
    success: true,
    channels_used: [] as string[],
    recipients_reached: 0,
    results: [] as any[]
  };

  // Apply routing rules
  for (const route of routes) {
    if (route.type === type || route.type === 'all') {
      for (const channel of route.channels) {
        try {
          const channelResult = await sendToChannel(channel, message, recipientPreferences);
          
          results.channels_used.push(channel);
          results.recipients_reached += channelResult.recipients_reached;
          results.results.push({
            channel,
            success: channelResult.success,
            recipients: channelResult.recipients_reached,
            details: channelResult.details
          });

        } catch (error) {
          results.success = false;
          results.results.push({
            channel,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
  }

  return results;
}

async function sendToChannel(channel: string, message: any, recipientPreferences: NotificationPreferences[]) {
  const result = {
    success: true,
    recipients_reached: 0,
    details: {} as any
  };

  // Filter recipients based on preferences
  const eligibleRecipients = recipientPreferences.filter(pref => {
    const channelEnabled = pref[`${channel}_enabled` as keyof NotificationPreferences] as boolean;
    return channelEnabled && pref.notification_types[message.type as keyof typeof pref.notification_types];
  });

  result.recipients_reached = eligibleRecipients.length;

  switch (channel) {
    case 'email':
      result.details = await sendEmailNotification(message, eligibleRecipients);
      break;
    case 'slack':
      result.details = await sendSlackNotification(message, eligibleRecipients);
      break;
    case 'webhook':
      result.details = await sendWebhookNotification(message, eligibleRecipients);
      break;
    case 'sms':
      result.details = await sendSMSNotification(message, eligibleRecipients);
      break;
    case 'in_app':
      result.details = await sendInAppNotification(message, eligibleRecipients);
      break;
    default:
      throw new Error(`Unknown channel: ${channel}`);
  }

  return result;
}

async function sendEmailNotification(message: any, recipients: NotificationPreferences[]) {
  // Mock email sending
  const emailResult = {
    provider: 'mock_email_service',
    emails_sent: recipients.length,
    template_used: 'default',
    delivery_status: 'queued'
  };

  console.log('Email notification sent:', {
    subject: message.subject,
    recipients: recipients.map(r => r.userId),
    result: emailResult
  });

  return emailResult;
}

async function sendSlackNotification(message: any, recipients: NotificationPreferences[]) {
  // Integration with existing Slack API
  const slackResult = {
    channels_notified: ['#content-updates'],
    messages_sent: 1,
    mentions: recipients.map(r => r.userId)
  };

  console.log('Slack notification sent:', {
    message: message.subject,
    recipients: recipients.map(r => r.userId),
    result: slackResult
  });

  return slackResult;
}

async function sendWebhookNotification(message: any, recipients: NotificationPreferences[]) {
  // Mock webhook sending
  const webhookResult = {
    endpoint: 'https://api.example.com/webhook',
    status_code: 200,
    response_time: '150ms',
    payload_size: '2.3kb'
  };

  console.log('Webhook notification sent:', {
    message: message.subject,
    recipients: recipients.length,
    result: webhookResult
  });

  return webhookResult;
}

async function sendSMSNotification(message: any, recipients: NotificationPreferences[]) {
  // Mock SMS sending
  const smsResult = {
    provider: 'mock_sms_service',
    messages_sent: recipients.length,
    estimated_cost: '$0.05',
    delivery_status: 'sent'
  };

  console.log('SMS notification sent:', {
    message: message.subject,
    recipients: recipients.length,
    result: smsResult
  });

  return smsResult;
}

async function sendInAppNotification(message: any, recipients: NotificationPreferences[]) {
  // Mock in-app notification
  const inAppResult = {
    notifications_created: recipients.length,
    push_notifications_sent: recipients.filter(r => r.userId).length,
    badge_updates: recipients.length
  };

  console.log('In-app notification sent:', {
    message: message.subject,
    recipients: recipients.length,
    result: inAppResult
  });

  return inAppResult;
}

async function getRoutesForNotification(type: string, priority: string): Promise<NotificationRoute[]> {
  // Mock notification routes - in production, this would be from database
  const routes: NotificationRoute[] = [
    {
      type: 'approval_request',
      priority: 'high',
      channels: ['slack', 'email', 'in_app'],
      template: 'approval_request',
      conditions: []
    },
    {
      type: 'content_published',
      priority: 'medium',
      channels: ['slack', 'in_app'],
      template: 'content_published',
      conditions: []
    },
    {
      type: 'system_alert',
      priority: 'urgent',
      channels: ['slack', 'email', 'sms'],
      template: 'system_alert',
      conditions: []
    },
    {
      type: 'daily_summary',
      priority: 'low',
      channels: ['slack', 'email'],
      template: 'daily_summary',
      conditions: []
    }
  ];

  return routes.filter(route => 
    route.type === type && 
    getPriorityLevel(route.priority) >= getPriorityLevel(priority)
  );
}

async function getRecipientsPreferences(recipients: string[]): Promise<NotificationPreferences[]> {
  // Mock recipient preferences - in production, this would be from database
  const mockPreferences: NotificationPreferences[] = [
    {
      userId: 'user1',
      email_enabled: true,
      slack_enabled: true,
      webhook_enabled: false,
      sms_enabled: false,
      in_app_enabled: true,
      notification_types: {
        approval_request: true,
        content_published: true,
        content_rejected: true,
        system_alert: true,
        daily_summary: false
      },
      priority_threshold: 'medium',
      quiet_hours: {
        enabled: true,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'UTC'
      }
    },
    {
      userId: 'user2',
      email_enabled: true,
      slack_enabled: false,
      webhook_enabled: true,
      sms_enabled: true,
      in_app_enabled: true,
      notification_types: {
        approval_request: true,
        content_published: false,
        content_rejected: true,
        system_alert: true,
        daily_summary: true
      },
      priority_threshold: 'high',
      quiet_hours: {
        enabled: false,
        start_time: '00:00',
        end_time: '00:00',
        timezone: 'UTC'
      }
    }
  ];

  return recipients.length > 0 
    ? mockPreferences.filter(pref => recipients.includes(pref.userId))
    : mockPreferences;
}

async function getNotificationPreferences(userId: string) {
  try {
    const preferences = await getRecipientsPreferences([userId]);
    
    return NextResponse.json({
      success: true,
      preferences: preferences[0] || getDefaultPreferences(userId)
    });

  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get notification preferences' },
      { status: 500 }
    );
  }
}

async function updateNotificationPreferences(userId: string, preferences: NotificationPreferences) {
  try {
    // Mock update - in production, this would update database
    console.log('Updating notification preferences for user:', userId, preferences);
    
    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

async function getNotificationHistory(userId?: string) {
  try {
    // Mock notification history
    const history = [
      {
        id: '1',
        type: 'approval_request',
        subject: 'New content ready for approval',
        sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        channels: ['slack', 'email'],
        status: 'delivered',
        recipients: ['user1', 'user2']
      },
      {
        id: '2',
        type: 'content_published',
        subject: 'Content published: API Rate Limiting',
        sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        channels: ['slack'],
        status: 'delivered',
        recipients: ['user1']
      }
    ];

    return NextResponse.json({
      success: true,
      history: userId ? history.filter(h => h.recipients.includes(userId)) : history,
      total: history.length
    });

  } catch (error) {
    console.error('Error getting notification history:', error);
    return NextResponse.json(
      { error: 'Failed to get notification history' },
      { status: 500 }
    );
  }
}

async function testNotificationChannel(channelType: string, userId?: string) {
  try {
    const testMessage = {
      subject: 'Test Notification',
      body: 'This is a test notification to verify your channel configuration.',
      type: 'system_alert'
    };

    const preferences = await getRecipientsPreferences(userId ? [userId] : []);
    const result = await sendToChannel(channelType, testMessage, preferences);

    return NextResponse.json({
      success: true,
      message: `Test notification sent via ${channelType}`,
      result
    });

  } catch (error) {
    console.error('Error testing notification channel:', error);
    return NextResponse.json(
      { error: 'Failed to test notification channel' },
      { status: 500 }
    );
  }
}

async function getNotificationRoutes() {
  const routes = await getRoutesForNotification('all', 'low');
  
  return NextResponse.json({
    success: true,
    routes,
    total: routes.length
  });
}

async function getNotificationStats(userId?: string) {
  // Mock stats
  const stats = {
    total_sent: 156,
    successful_deliveries: 148,
    failed_deliveries: 8,
    channels_used: {
      email: 89,
      slack: 67,
      webhook: 23,
      sms: 12,
      in_app: 145
    },
    top_notification_types: {
      approval_request: 45,
      content_published: 38,
      system_alert: 12,
      daily_summary: 7
    }
  };

  return NextResponse.json({
    success: true,
    stats,
    period: 'last_30_days'
  });
}

async function getActiveRoutes() {
  return [
    'approval_request → slack, email, in_app',
    'content_published → slack, in_app',
    'system_alert → slack, email, sms',
    'daily_summary → slack, email'
  ];
}

async function logNotification(params: any) {
  // Mock logging - in production, this would log to database
  console.log('Notification logged:', params);
}

function getDefaultPreferences(userId: string): NotificationPreferences {
  return {
    userId,
    email_enabled: true,
    slack_enabled: true,
    webhook_enabled: false,
    sms_enabled: false,
    in_app_enabled: true,
    notification_types: {
      approval_request: true,
      content_published: true,
      content_rejected: true,
      system_alert: true,
      daily_summary: false
    },
    priority_threshold: 'medium',
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00',
      timezone: 'UTC'
    }
  };
}

function getPriorityLevel(priority: string): number {
  const levels = { low: 1, medium: 2, high: 3, urgent: 4 };
  return levels[priority as keyof typeof levels] || 2;
}

async function configureNotifications(params: any) {
  // Mock configuration
  return NextResponse.json({
    success: true,
    message: 'Notification configuration updated',
    config: params
  });
}