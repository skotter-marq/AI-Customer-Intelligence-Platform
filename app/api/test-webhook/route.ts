import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const timestamp = new Date().toISOString();
    
    console.log('🧪 TEST WEBHOOK RECEIVED:', {
      timestamp,
      event: payload.webhookEvent,
      issueKey: payload.issue?.key,
      eventType: payload.issue_event_type_name,
      statusChange: payload.changelog?.items?.find(item => item.field === 'status'),
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // Log the full payload for debugging
    console.log('📦 Full webhook payload:', JSON.stringify(payload, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Test webhook received successfully',
      timestamp,
      issueKey: payload.issue?.key,
      event: payload.webhookEvent
    });
    
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString(),
    endpoint: '/api/test-webhook'
  });
}