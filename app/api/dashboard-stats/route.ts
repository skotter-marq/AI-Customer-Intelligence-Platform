import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET() {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Get meeting counts
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*');

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
    }

    // Get content/changelog counts
    const { data: content, error: contentError } = await supabase
      .from('generated_content')
      .select('*');

    if (contentError) {
      console.error('Error fetching content:', contentError);
    }

    // Get insights counts
    const { data: insights, error: insightsError } = await supabase
      .from('meeting_insights')
      .select('*');

    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
    }

    // Get product updates counts
    const { data: productUpdates, error: updatesError } = await supabase
      .from('product_updates')
      .select('*');

    if (updatesError) {
      console.error('Error fetching product updates:', updatesError);
    }

    // Get HubSpot data counts
    const { data: hubspotContacts, error: contactsError } = await supabase
      .from('hubspot_contacts')
      .select('*');

    const { data: hubspotDeals, error: dealsError } = await supabase
      .from('hubspot_deals')
      .select('*');

    // Calculate this week's data (for trend calculation)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentMeetings } = await supabase
      .from('meetings')
      .select('*')
      .gte('created_at', oneWeekAgo.toISOString());

    const { data: recentContent } = await supabase
      .from('generated_content')
      .select('*')
      .gte('created_at', oneWeekAgo.toISOString());

    const { data: recentInsights } = await supabase
      .from('meeting_insights')
      .select('*')
      .gte('created_at', oneWeekAgo.toISOString());

    const { data: recentUpdates } = await supabase
      .from('product_updates')
      .select('*')
      .gte('created_at', oneWeekAgo.toISOString());

    // Calculate statistics
    const stats = {
      contentPosts: {
        total: content?.length || 0,
        recent: recentContent?.length || 0,
        change: calculatePercentageChange(content?.length || 0, recentContent?.length || 0)
      },
      meetings: {
        total: meetings?.length || 0,
        recent: recentMeetings?.length || 0,
        change: calculatePercentageChange(meetings?.length || 0, recentMeetings?.length || 0)
      },
      insights: {
        total: insights?.length || 0,
        recent: recentInsights?.length || 0,
        change: calculatePercentageChange(insights?.length || 0, recentInsights?.length || 0)
      },
      productUpdates: {
        total: productUpdates?.length || 0,
        recent: recentUpdates?.length || 0,
        change: calculatePercentageChange(productUpdates?.length || 0, recentUpdates?.length || 0)
      },
      hubspot: {
        contacts: hubspotContacts?.length || 0,
        deals: hubspotDeals?.length || 0
      }
    };

    console.log('✅ Dashboard stats calculated:', {
      content: stats.contentPosts.total,
      meetings: stats.meetings.total,
      insights: stats.insights.total,
      updates: stats.productUpdates.total
    });

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculatePercentageChange(total: number, recent: number): string {
  if (total === 0) return '+0%';
  
  // Estimate previous period (total - recent) for percentage calculation
  const previous = Math.max(total - recent, 1);
  const change = ((recent / previous) - 1) * 100;
  
  if (change > 0) {
    return `+${Math.round(change)}%`;
  } else if (change < 0) {
    return `${Math.round(change)}%`;
  } else {
    return '0%';
  }
}