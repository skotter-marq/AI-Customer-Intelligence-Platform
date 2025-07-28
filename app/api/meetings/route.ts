import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const customer = searchParams.get('customer');
    const sentiment = searchParams.get('sentiment');
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');

    // Build query with filters
    let query = supabase
      .from('meetings')
      .select(`
        *,
        meeting_insights (
          id,
          insight_type,
          title,
          importance_score,
          priority
        ),
        meeting_action_items (
          id,
          description,
          status,
          priority,
          due_date
        ),
        meeting_feature_requests (
          id,
          feature_title,
          urgency,
          status
        ),
        meeting_competitive_intel (
          id,
          competitor_name,
          threat_level
        )
      `)
      .order('meeting_date', { ascending: false });

    // Apply filters
    if (customer && customer !== 'all') {
      query = query.ilike('customer_name', `%${customer}%`);
    }

    if (sentiment && sentiment !== 'all') {
      query = query.eq('sentiment_label', sentiment);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      }
      
      query = query.gte('meeting_date', startDate.toISOString());
    }

    // Apply pagination
    const { data: meetings, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const transformedMeetings = (meetings || []).map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      customer: meeting.customer_name,
      date: meeting.meeting_date,
      duration: meeting.duration_minutes ? `${meeting.duration_minutes} min` : 'Unknown',
      sentiment: meeting.sentiment_label || 'neutral',
      summary: meeting.meeting_summary || 'Meeting analysis pending...',
      keyTopics: extractKeyTopics(meeting),
      actionItems: meeting.meeting_action_items?.map((item: any) => item.description) || [],
      attendees: meeting.attendees?.map((a: any) => a.name || a.email || 'Unknown') || [],
      recording_url: meeting.recording_url,
      transcript_url: meeting.transcript_url,
      grain_share_url: meeting.grain_share_url,
      status: meeting.status,
      priority: calculatePriority(meeting),
      tags: extractTags(meeting),
      insights_count: meeting.meeting_insights?.length || 0,
      feature_requests_count: meeting.meeting_feature_requests?.length || 0,
      competitive_mentions_count: meeting.meeting_competitive_intel?.length || 0,
      sentiment_score: meeting.sentiment_score
    }));

    return NextResponse.json({
      success: true,
      meetings: transformedMeetings,
      pagination: {
        limit,
        offset,
        total: count || transformedMeetings.length,
        hasMore: (offset + limit) < (count || transformedMeetings.length)
      },
      stats: {
        total_meetings: count || transformedMeetings.length,
        analyzed_meetings: transformedMeetings.filter(m => m.status === 'analyzed').length,
        positive_sentiment: transformedMeetings.filter(m => m.sentiment === 'positive').length,
        feature_requests: transformedMeetings.reduce((sum, m) => sum + m.feature_requests_count, 0),
        competitive_mentions: transformedMeetings.reduce((sum, m) => sum + m.competitive_mentions_count, 0)
      }
    });

  } catch (error) {
    console.error('Meetings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'get_insights':
        return await getMeetingInsights(params.meetingId);
      case 'get_action_items':
        return await getMeetingActionItems(params.meetingId);
      case 'update_action_item':
        return await updateActionItem(params.actionId, params.updates);
      case 'get_transcript':
        return await getMeetingTranscript(params.meetingId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Meetings POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractKeyTopics(meeting: any): string[] {
  // Extract from insights and feature requests
  const topics = new Set<string>();
  
  meeting.meeting_insights?.forEach((insight: any) => {
    if (insight.title) {
      topics.add(insight.title);
    }
  });
  
  meeting.meeting_feature_requests?.forEach((request: any) => {
    if (request.feature_title) {
      topics.add(request.feature_title);
    }
  });
  
  return Array.from(topics).slice(0, 5);
}

function calculatePriority(meeting: any): 'high' | 'medium' | 'low' {
  // Calculate priority based on insights and competitive mentions
  const highPriorityInsights = meeting.meeting_insights?.filter(
    (insight: any) => insight.priority === 'high' || insight.priority === 'critical'
  ).length || 0;
  
  const competitiveMentions = meeting.meeting_competitive_intel?.filter(
    (intel: any) => intel.threat_level === 'high' || intel.threat_level === 'critical'
  ).length || 0;
  
  const sentimentScore = meeting.sentiment_score || 0;
  
  if (highPriorityInsights > 2 || competitiveMentions > 0 || sentimentScore < -0.5) {
    return 'high';
  } else if (highPriorityInsights > 0 || sentimentScore < 0) {
    return 'medium';
  } else {
    return 'low';
  }
}

function extractTags(meeting: any): string[] {
  const tags = new Set<string>();
  
  // Add meeting type as tag
  if (meeting.meeting_type) {
    tags.add(meeting.meeting_type);
  }
  
  // Add sentiment as tag
  if (meeting.sentiment_label) {
    tags.add(meeting.sentiment_label);
  }
  
  // Add priority insights as tags
  meeting.meeting_insights?.forEach((insight: any) => {
    if (insight.priority === 'high' || insight.priority === 'critical') {
      tags.add('High Priority');
    }
  });
  
  // Add competitive mentions as tags
  if (meeting.meeting_competitive_intel?.length > 0) {
    tags.add('Competitive Intel');
  }
  
  // Add feature requests as tags
  if (meeting.meeting_feature_requests?.length > 0) {
    tags.add('Feature Requests');
  }
  
  return Array.from(tags).slice(0, 4);
}

async function getMeetingInsights(meetingId: string) {
  try {
    const { data: insights, error } = await supabase
      .from('meeting_insights')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('importance_score', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      insights: insights || []
    });

  } catch (error) {
    console.error('Error fetching meeting insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

async function getMeetingActionItems(meetingId: string) {
  try {
    const { data: actionItems, error } = await supabase
      .from('meeting_action_items')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      actionItems: actionItems || []
    });

  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action items' },
      { status: 500 }
    );
  }
}

async function updateActionItem(actionId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('meeting_action_items')
      .update(updates)
      .eq('id', actionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      actionItem: data
    });

  } catch (error) {
    console.error('Error updating action item:', error);
    return NextResponse.json(
      { error: 'Failed to update action item' },
      { status: 500 }
    );
  }
}

async function getMeetingTranscript(meetingId: string) {
  try {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('full_transcript, transcript_url, title, customer_name')
      .eq('id', meetingId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      transcript: meeting.full_transcript,
      transcript_url: meeting.transcript_url,
      meeting_title: meeting.title,
      customer: meeting.customer_name
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}