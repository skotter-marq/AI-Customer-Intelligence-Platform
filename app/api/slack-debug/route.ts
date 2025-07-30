import { NextResponse } from 'next/server';

// Simple debug endpoint to test Slack webhooks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Debug: Received request:', JSON.stringify(body, null, 2));

    // Test message
    const testMessage = {
      text: "🚀 **Debug Test**\n\n**Title:** Test\n**JIRA:** DEBUG-123\n\nThis is a debug test message."
    };

    console.log('Debug: Sending message:', JSON.stringify(testMessage, null, 2));

    const webhookUrl = process.env.SLACK_WEBHOOK_UPDATES;
    console.log('Debug: Using webhook URL:', webhookUrl ? 'configured' : 'missing');

    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'No webhook URL configured',
        env_check: {
          SLACK_WEBHOOK_UPDATES: !!process.env.SLACK_WEBHOOK_UPDATES,
          SLACK_WEBHOOK_APPROVALS: !!process.env.SLACK_WEBHOOK_APPROVALS,
          SLACK_WEBHOOK_INSIGHTS: !!process.env.SLACK_WEBHOOK_INSIGHTS,
          SLACK_WEBHOOK_CONTENT: !!process.env.SLACK_WEBHOOK_CONTENT
        }
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('Debug: Slack response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Debug: Slack error response:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `Slack webhook failed: ${response.status}`,
        slack_response: errorText,
        sent_message: testMessage
      });
    }

    const result = await response.text();
    console.log('Debug: Slack success response:', result);

    return NextResponse.json({
      success: true,
      message: 'Debug message sent successfully',
      slack_response: result,
      sent_message: testMessage
    });

  } catch (error) {
    console.error('Debug: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}