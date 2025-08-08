import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    console.log('🏗️ Attempting to create insight tables...');

    // Sample meeting IDs from our seeded data
    const meetingIds = [
      '660e8400-e29b-41d4-a716-446655440001', // TechFlow Demo
      '660e8400-e29b-41d4-a716-446655440002', // DataCorp QBR
      '660e8400-e29b-41d4-a716-446655440003', // StartupX Support
      '660e8400-e29b-41d4-a716-446655440004'  // TechFlow Discovery
    ];

    // Sample insights for different meetings
    const insights = [
      {
        meeting_id: meetingIds[0], // TechFlow Demo
        insight_type: 'pain_point',
        category: 'productivity',
        title: 'Manual Meeting Review Process',
        description: 'Customer currently has someone manually reviewing all customer calls, which is time-consuming and inefficient.',
        quote: 'We currently have someone manually reviewing all our customer calls, which takes forever.',
        importance_score: 0.9,
        confidence_score: 0.95,
        priority: 'high',
        tags: ['manual-process', 'productivity', 'resource-intensive'],
        affected_feature: 'Meeting Analysis',
      },
      {
        meeting_id: meetingIds[0],
        insight_type: 'feature_interest',
        category: 'integration',
        title: 'Strong Interest in JIRA Integration',
        description: 'Customer expressed specific interest in JIRA integration and feature request prioritization capabilities.',
        quote: 'We are particularly interested in the JIRA integration and how it handles feature request prioritization.',
        importance_score: 0.85,
        confidence_score: 0.9,
        priority: 'high',
        tags: ['integration', 'jira', 'feature-requests'],
        affected_feature: 'JIRA Integration',
      },
      {
        meeting_id: meetingIds[1], // DataCorp QBR  
        insight_type: 'usage_growth',
        category: 'adoption',
        title: 'Significant Usage Growth',
        description: 'Customer has grown from minimal usage to processing 200+ customer interactions per month, showing strong adoption.',
        quote: 'Our usage has grown significantly - we are now processing about 200 customer interactions per month.',
        importance_score: 0.8,
        confidence_score: 1.0,
        priority: 'medium',
        tags: ['growth', 'adoption', 'success'],
      },
      {
        meeting_id: meetingIds[1],
        insight_type: 'competitive_concern',
        category: 'retention',
        title: 'Competitive Pressure Detected',
        description: 'Customer mentioned having close calls with customers considering other platforms, indicating competitive threats.',
        quote: 'We have had a few close calls with customers considering other platforms.',
        importance_score: 0.75,
        confidence_score: 0.8,
        priority: 'high',
        tags: ['competition', 'churn-risk', 'retention'],
        affected_feature: 'Competitive Intelligence',
      },
      {
        meeting_id: meetingIds[2], // StartupX Support
        insight_type: 'technical_issue',
        category: 'support',
        title: 'API Rate Limiting Problems',
        description: 'Customer experiencing 429 rate limiting errors affecting their data sync process and dashboard updates.',
        quote: 'Since about 8 AM this morning, we are getting 429 rate limiting errors, but we have not changed anything on our end.',
        importance_score: 0.9,
        confidence_score: 1.0,
        priority: 'critical',
        tags: ['api', 'rate-limiting', 'technical-issue'],
        affected_feature: 'API Rate Limiting',
      }
    ];

    // Sample action items
    const actionItems = [
      {
        meeting_id: meetingIds[0],
        description: 'Set up technical deep-dive session with TechFlow team',
        assigned_to: 'Jessica Park',
        priority: 'high',
        category: 'follow_up',
        due_date: '2025-08-12T14:00:00Z',
        status: 'pending'
      },
      {
        meeting_id: meetingIds[0],
        description: 'Start pilot program with actual customer data',
        assigned_to: 'Alex Rodriguez',
        priority: 'high', 
        category: 'implementation',
        due_date: '2025-08-15T17:00:00Z',
        status: 'pending'
      },
      {
        meeting_id: meetingIds[1],
        description: 'Provide beta access to competitive intelligence features',
        assigned_to: 'Rachel Green',
        priority: 'medium',
        category: 'product',
        due_date: '2025-09-01T12:00:00Z',
        status: 'in_progress'
      },
      {
        meeting_id: meetingIds[2],
        description: 'Apply temporary rate limit exception for StartupX',
        assigned_to: 'Maria Garcia',
        priority: 'critical',
        category: 'support',
        due_date: '2025-08-01T18:00:00Z',
        status: 'completed'
      }
    ];

    // Sample feature requests
    const featureRequests = [
      {
        meeting_id: meetingIds[0],
        feature_title: 'Enhanced JIRA Integration',
        feature_description: 'Deeper integration with JIRA for automatic feature request creation and prioritization based on customer feedback.',
        business_value: 'Streamline product management workflow and ensure customer feedback directly influences roadmap',
        urgency: 'high',
        customer_pain_point: 'Manual process of linking customer feedback to development tickets',
        estimated_impact: 'High - would save 10+ hours per week for product team',
        status: 'under_review'
      },
      {
        meeting_id: meetingIds[1],
        feature_title: 'Advanced Competitive Intelligence',
        feature_description: 'Automated competitor mention detection with threat level assessment and opportunity identification.',
        business_value: 'Improve customer retention by proactively addressing competitive concerns',
        urgency: 'medium',
        customer_pain_point: 'Manual tracking of competitor mentions in customer conversations',
        estimated_impact: 'Medium - would help prevent customer churn',
        status: 'in_development'
      }
    ];

    // Sample topics
    const topics = [
      {
        meeting_id: meetingIds[0],
        topic: 'Security and Compliance',
        topic_category: 'security',
        relevance_score: 0.8,
        sentiment_score: 0.1,
        keywords: ['SOC 2', 'security', 'data privacy', 'encryption']
      },
      {
        meeting_id: meetingIds[0], 
        topic: 'Integration Capabilities',
        topic_category: 'technical',
        relevance_score: 0.9,
        sentiment_score: 0.7,
        keywords: ['HubSpot', 'JIRA', 'Slack', 'workflow']
      },
      {
        meeting_id: meetingIds[1],
        topic: 'Usage Analytics',
        topic_category: 'metrics',
        relevance_score: 0.7,
        sentiment_score: 0.8,
        keywords: ['200 interactions', 'growth', 'monthly usage']
      }
    ];

    // Sample competitive intelligence
    const competitiveIntel = [
      {
        meeting_id: meetingIds[1],
        competitor_name: 'Unknown Platform',
        mention_type: 'consideration',
        context: 'Customer mentioned customers are considering switching to other platforms',
        sentiment: 'negative',
        threat_level: 'medium',
        quote: 'We have had a few close calls with customers considering other platforms.'
      }
    ];

    // Insert all the sample data
    const results = await Promise.all([
      supabase.from('meeting_insights').upsert(insights, { onConflict: 'id' }),
      supabase.from('meeting_action_items').upsert(actionItems, { onConflict: 'id' }),
      supabase.from('meeting_feature_requests').upsert(featureRequests, { onConflict: 'id' }),
      supabase.from('meeting_topics').upsert(topics, { onConflict: 'id' }),
      supabase.from('meeting_competitive_intel').upsert(competitiveIntel, { onConflict: 'id' })
    ]);

    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors inserting insights data:', errors);
      return NextResponse.json(
        { error: 'Failed to insert some insights data', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting insights and intelligence data seeded successfully',
      counts: {
        insights: insights.length,
        actionItems: actionItems.length,
        featureRequests: featureRequests.length,
        topics: topics.length,
        competitiveIntel: competitiveIntel.length
      }
    });

  } catch (error) {
    console.error('Seed insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}