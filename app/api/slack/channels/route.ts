import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const slackToken = process.env.SLACK_BOT_TOKEN;

    if (!slackToken) {
      console.log('⚠️ Slack token not configured, using fallback channels');
      return NextResponse.json({
        success: false,
        error: 'Slack token not configured',
        data: getFallbackChannels()
      });
    }

    console.log('🔍 Fetching Slack channels...');

    const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=100', {
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Slack API error:', data.error);
      return NextResponse.json({
        success: false,
        error: `Slack API error: ${data.error}`,
        data: getFallbackChannels()
      });
    }

    const channels = data.channels
      .filter((channel: any) => !channel.is_archived && !channel.is_im && !channel.is_mpim)
      .map((channel: any) => ({
        id: channel.id,
        name: `#${channel.name}`,
        purpose: channel.purpose?.value || '',
        isMember: channel.is_member,
        isPrivate: channel.is_private
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    console.log(`✅ Found ${channels.length} Slack channels`);

    return NextResponse.json({
      success: true,
      data: channels,
      lastFetched: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch Slack channels:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Slack channels',
      data: getFallbackChannels()
    });
  }
}

function getFallbackChannels() {
  return [
    { id: 'C001', name: '#product-updates', purpose: 'Product release notifications', isMember: true, isPrivate: false },
    { id: 'C002', name: '#customer-insights', purpose: 'Customer feedback and insights', isMember: true, isPrivate: false },
    { id: 'C003', name: '#content-approvals', purpose: 'Content approval workflow', isMember: true, isPrivate: false },
    { id: 'C004', name: '#content-pipeline', purpose: 'Content creation pipeline', isMember: true, isPrivate: false }
  ];
}