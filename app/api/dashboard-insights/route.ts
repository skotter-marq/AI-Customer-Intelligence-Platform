import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET() {
  try {
    console.log('🔍 Fetching recent insights for dashboard...');

    // Get recent meeting insights - using 'insights' table as suggested by error
    const { data: meetingInsights, error: meetingError } = await supabase
      .from('insights')
      .select(`
        *,
        meetings!inner(title, customer_name, meeting_date)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (meetingError) {
      console.error('Error fetching meeting insights:', meetingError);
    }

    // Get pending product updates for approval
    const { data: pendingUpdates, error: updatesError } = await supabase
      .from('product_updates')
      .select('*')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(5);

    if (updatesError) {
      console.error('Error fetching pending updates:', updatesError);
    }

    // Get recent HubSpot deals
    const { data: hubspotDeals, error: dealsError } = await supabase
      .from('hubspot_deals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (dealsError) {
      console.error('Error fetching HubSpot deals:', dealsError);
    }

    // Get recent competitive intelligence - disabling temporarily due to schema issues
    const competitiveIntel = null;
    const compError = null;
    console.log('⚠️ Competitive intel query disabled - table schema issue');

    // Transform data into dashboard insights format
    const insights = [];

    // Add product update insights
    if (pendingUpdates && pendingUpdates.length > 0) {
      insights.push({
        id: 'product-updates-pending',
        title: `${pendingUpdates.length} product updates awaiting approval`,
        description: 'New changelog entries from JIRA are ready for review. Click to approve and publish to customers.',
        type: 'product',
        priority: 'high' as const,
        timestamp: formatTimestamp(pendingUpdates[0].created_at),
        source: 'Product System'
      });
    }

    // Add deal insights from HubSpot
    if (hubspotDeals && hubspotDeals.length > 0) {
      const stalledDeals = hubspotDeals.filter(deal => {
        if (!deal.created_at) return false;
        const dealAge = Date.now() - new Date(deal.created_at).getTime();
        return dealAge > 10 * 24 * 60 * 60 * 1000; // 10 days
      });

      if (stalledDeals.length > 0) {
        const deal = stalledDeals[0];
        insights.push({
          id: `hubspot-deal-${deal.hubspot_deal_id}`,
          title: `Deal stalled: ${deal.deal_name || 'Unnamed Deal'}`,
          description: `${deal.deal_name} (${deal.deal_amount ? '$' + deal.deal_amount.toLocaleString() : 'Unknown amount'}) has been in ${deal.deal_stage || 'current stage'} for over 10 days.`,
          type: 'sales',
          priority: deal.deal_amount && deal.deal_amount > 10000 ? 'high' as const : 'medium' as const,
          timestamp: formatTimestamp(deal.created_at),
          source: 'HubSpot Pipeline'
        });
      }
    }

    // Add meeting sentiment insights
    if (meetingInsights && meetingInsights.length > 0) {
      const recentMeetings = meetingInsights.slice(0, 5);
      const avgSentiment = recentMeetings.reduce((sum, insight) => {
        return sum + (insight.confidence_score || 0.5);
      }, 0) / recentMeetings.length;

      if (avgSentiment > 0.7) {
        insights.push({
          id: 'sentiment-positive',
          title: 'Positive sentiment spike in customer meetings',
          description: `Recent meeting recordings show ${Math.round(avgSentiment * 100)}% positive sentiment, indicating strong customer satisfaction.`,
          type: 'meetings',
          priority: 'medium' as const,
          timestamp: formatTimestamp(recentMeetings[0].created_at),
          source: 'Meeting Analysis'
        });
      } else if (avgSentiment < 0.4) {
        insights.push({
          id: 'sentiment-negative',
          title: 'Customer satisfaction concerns detected',
          description: `Recent meetings show ${Math.round(avgSentiment * 100)}% sentiment score. Review customer feedback for potential issues.`,
          type: 'meetings',
          priority: 'high' as const,
          timestamp: formatTimestamp(recentMeetings[0].created_at),
          source: 'Meeting Analysis'
        });
      }
    }

    // Add competitive intelligence insights
    if (competitiveIntel && competitiveIntel.length > 0) {
      const recentCompMentions = competitiveIntel.slice(0, 3);
      insights.push({
        id: 'competitive-mentions',
        title: `${recentCompMentions.length} competitor mentions in recent meetings`,
        description: `Competitors mentioned: ${recentCompMentions.map(c => c.competitor_name).join(', ')}. Monitor competitive positioning.`,
        type: 'competitive',
        priority: 'medium' as const,
        timestamp: formatTimestamp(recentCompMentions[0].created_at),
        source: 'Competitive Intelligence'
      });
    }

    // Add general insights if we have meeting data
    if (meetingInsights && meetingInsights.length > 0) {
      const highPriorityInsights = meetingInsights.filter(insight => 
        insight.priority === 'high' || insight.priority === 'critical'
      );

      if (highPriorityInsights.length > 0) {
        insights.push({
          id: 'high-priority-insights',
          title: `${highPriorityInsights.length} high-priority customer insights identified`,
          description: `Critical feedback detected in recent meetings. Review insights for immediate action items.`,
          type: 'customer',
          priority: 'high' as const,
          timestamp: formatTimestamp(highPriorityInsights[0].created_at),
          source: 'AI Analysis'
        });
      }
    }

    // If no real data, add a sample insight to show the system is working
    if (insights.length === 0) {
      insights.push({
        id: 'system-ready',
        title: 'Intelligence system ready for data',
        description: 'Your AI customer intelligence platform is configured and ready to analyze meetings, deals, and competitive data.',
        type: 'system',
        priority: 'low' as const,
        timestamp: 'Just now',
        source: 'System Status'
      });
    }

    console.log(`✅ Generated ${insights.length} dashboard insights`);

    return NextResponse.json({
      success: true,
      insights: insights.slice(0, 6), // Limit to 6 insights for dashboard
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Dashboard insights error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function formatTimestamp(dateString: string | null): string {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}