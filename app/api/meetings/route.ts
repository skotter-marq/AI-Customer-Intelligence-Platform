import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

// Helper functions for data transformation
function extractTopicsFromTranscript(transcript: string): string[] {
  if (!transcript) return [];
  // Simple keyword extraction - can be enhanced with AI/NLP
  const words = transcript.toLowerCase().split(/\s+/);
  const topicWords = words.filter(word => 
    word.length > 4 && 
    !['meeting', 'discussion', 'talked', 'about', 'think', 'would', 'could', 'should'].includes(word)
  );
  return [...new Set(topicWords)].slice(0, 5);
}

function extractActionItemsFromTranscript(transcript: string): string[] {
  if (!transcript) return [];
  // Extract sentences with action words
  const sentences = transcript.split(/[.!?]+/);
  const actionWords = ['will', 'should', 'need to', 'follow up', 'action', 'next step'];
  return sentences
    .filter(sentence => actionWords.some(word => sentence.toLowerCase().includes(word)))
    .map(sentence => sentence.trim())
    .slice(0, 3);
}

function extractTagsFromMeeting(meeting: any): string[] {
  const tags = [];
  if (meeting.sentiment_label) tags.push(meeting.sentiment_label);
  if (meeting.status) tags.push(meeting.status);
  if (meeting.duration_minutes > 60) tags.push('long-meeting');
  return tags;
}

function inferPriorityFromSentiment(sentimentScore: number): 'high' | 'medium' | 'low' {
  if (!sentimentScore) return 'medium';
  if (sentimentScore < -0.3) return 'high'; // Negative sentiment = high priority
  if (sentimentScore > 0.5) return 'low'; // Very positive = low priority
  return 'medium';
}

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

    // Build query with filters - using actual database schema from 01_customer_research_schema.sql
    let query = supabase
      .from('meetings')
      .select(`
        *,
        customers(name, company, industry, segment)
      `)
      .order('date', { ascending: false });

    // Apply filters using correct schema
    if (customer && customer !== 'all') {
      query = query.ilike('title', `%${customer}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('meeting_status', status);
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
      
      query = query.gte('created_at', startDate.toISOString());
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

    // For now, set counts to 0 since insight tables may not exist yet
    const insightsCounts: any = {};
    const competitiveCounts: any = {};

    // Transform data to match frontend interface
    const transformedMeetings = (meetings || []).map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title || 'Untitled Meeting',
      customer: meeting.customers?.name || meeting.customers?.company || 'Unknown Customer',
      date: meeting.date || meeting.created_at,
      duration: meeting.duration_minutes ? `${meeting.duration_minutes} min` : 'Unknown',
      sentiment: 'neutral',
      summary: meeting.description || 
        (meeting.raw_transcript ? 
          meeting.raw_transcript.substring(0, 200) + '...' : 
          'No description available'),
      keyTopics: extractTopicsFromTranscript(meeting.raw_transcript),
      actionItems: extractActionItemsFromTranscript(meeting.raw_transcript),
      attendees: meeting.participants || [],
      recording_url: meeting.recording_url,
      transcript_url: null,
      grain_share_url: null,
      status: meeting.meeting_status || 'pending',
      priority: 'medium',
      tags: extractTagsFromMeeting(meeting),
      insights_count: insightsCounts[meeting.id] || 0,
      feature_requests_count: insightsCounts[meeting.id] || 0,
      competitive_mentions_count: competitiveCounts[meeting.id] || 0,
      sentiment_score: 0.5,
      grain_meeting_id: meeting.grain_meeting_id,
      metadata: meeting.metadata,
      // Additional fields available from database
      customer_id: meeting.customer_id,
      grain_id: meeting.grain_id,
      raw_transcript: meeting.raw_transcript,
      customer_info: meeting.customers
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

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('id');
    
    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting meeting: ${meetingId}`);

    // First, get the meeting details for logging
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('id, title, grain_id')
      .eq('id', meetingId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Delete the meeting
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ Meeting deleted successfully: "${meeting.title}" (${meetingId})`);

    return NextResponse.json({
      success: true,
      message: 'Meeting deleted successfully',
      deletedMeeting: {
        id: meeting.id,
        title: meeting.title,
        grain_id: meeting.grain_id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}


async function getMeetingInsights(meetingId: string) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
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
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
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
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
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
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('raw_transcript, title, customer_id, customers(name)')
      .eq('id', meetingId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      transcript: meeting.raw_transcript,
      transcript_url: null, // Not available in current schema
      meeting_title: meeting.title,
      customer: meeting.customers?.name || 'Unknown'
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}