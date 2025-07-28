import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const meetingId = params.id;

    // Fetch comprehensive meeting data with all related information
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();

    if (meetingError) {
      console.error('Meeting fetch error:', meetingError);
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    const [
      insightsResult,
      actionItemsResult,
      featureRequestsResult,
      competitiveIntelResult,
      topicsResult,
      participantsResult,
      outcomesResult
    ] = await Promise.all([
      // Meeting insights
      supabase
        .from('meeting_insights')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('importance_score', { ascending: false }),

      // Action items
      supabase
        .from('meeting_action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('priority', { ascending: false }),

      // Feature requests
      supabase
        .from('meeting_feature_requests')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('urgency', { ascending: false }),

      // Competitive intelligence
      supabase
        .from('meeting_competitive_intel')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('threat_level', { ascending: false }),

      // Topics discussed
      supabase
        .from('meeting_topics')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('relevance_score', { ascending: false }),

      // Meeting participants
      supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId),

      // Meeting outcomes
      supabase
        .from('meeting_outcomes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single()
    ]);

    // Process attendees data
    const attendees = meeting.attendees || [];
    const participants = participantsResult.data || [];
    
    // Merge attendees with participant data if available
    const enhancedAttendees = attendees.map((attendee: any) => {
      const participant = participants.find((p: any) => 
        p.email === attendee.email || p.name === attendee.name
      );
      
      return {
        name: attendee.name || participant?.name || 'Unknown',
        email: attendee.email || participant?.email,
        role: participant?.role || attendee.role || 'Participant',
        company: participant?.company || meeting.customer_name,
        is_internal: participant?.is_internal || attendee.email?.includes('@company.com') // Replace with your domain
      };
    });

    // Calculate meeting analytics
    const analytics = calculateMeetingAnalytics(meeting, {
      insights: insightsResult.data || [],
      actionItems: actionItemsResult.data || [],
      featureRequests: featureRequestsResult.data || [],
      competitiveIntel: competitiveIntelResult.data || [],
      topics: topicsResult.data || []
    });

    return NextResponse.json({
      success: true,
      meeting: {
        ...meeting,
        attendees: enhancedAttendees
      },
      insights: insightsResult.data || [],
      action_items: actionItemsResult.data || [],
      feature_requests: featureRequestsResult.data || [],
      competitive_intel: competitiveIntelResult.data || [],
      topics: topicsResult.data || [],
      participants: participantsResult.data || [],
      outcomes: outcomesResult.data,
      analytics
    });

  } catch (error) {
    console.error('Meeting detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const meetingId = params.id;
    const body = await request.json();
    const { action, ...updateData } = body;

    switch (action) {
      case 'update_meeting':
        return await updateMeeting(meetingId, updateData);
      case 'add_note':
        return await addMeetingNote(meetingId, updateData);
      case 'update_action_item':
        return await updateActionItem(updateData.actionId, updateData.updates);
      case 'mark_insight_reviewed':
        return await markInsightReviewed(updateData.insightId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Meeting update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateMeetingAnalytics(meeting: any, relatedData: any) {
  const { insights, actionItems, featureRequests, competitiveIntel, topics } = relatedData;

  // Calculate engagement score based on content generated
  const contentScore = insights.length + actionItems.length + featureRequests.length + competitiveIntel.length;
  const engagementScore = Math.min(100, Math.round((contentScore / meeting.duration_minutes) * 60 * 10));

  // Calculate priority distribution
  const highPriorityItems = [
    ...insights.filter((i: any) => i.priority === 'high' || i.priority === 'critical'),
    ...actionItems.filter((a: any) => a.priority === 'high' || a.priority === 'critical'),
    ...featureRequests.filter((f: any) => f.urgency === 'high' || f.urgency === 'critical')
  ].length;

  // Calculate topic diversity
  const uniqueCategories = new Set(topics.map((t: any) => t.topic_category)).size;

  // Calculate business impact score
  const businessImpactScore = Math.round(
    (featureRequests.length * 0.4 + 
     competitiveIntel.length * 0.3 + 
     highPriorityItems * 0.3) * 20
  );

  return {
    engagement_score: engagementScore,
    high_priority_items: highPriorityItems,
    topic_diversity: uniqueCategories,
    business_impact_score: Math.min(100, businessImpactScore),
    content_density: Math.round(contentScore / meeting.duration_minutes * 60),
    sentiment_trend: meeting.sentiment_score > 0.6 ? 'positive' : meeting.sentiment_score < -0.2 ? 'negative' : 'neutral'
  };
}

async function updateMeeting(meetingId: string, updateData: any) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', meetingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      meeting: data
    });

  } catch (error) {
    console.error('Update meeting error:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

async function addMeetingNote(meetingId: string, noteData: any) {
  try {
    // Add to meeting metadata or create a separate notes table
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('metadata')
      .eq('id', meetingId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const updatedMetadata = {
      ...meeting.metadata,
      notes: [
        ...(meeting.metadata?.notes || []),
        {
          id: Date.now().toString(),
          content: noteData.content,
          author: noteData.author,
          created_at: new Date().toISOString()
        }
      ]
    };

    const { data, error } = await supabase
      .from('meetings')
      .update({ metadata: updatedMetadata })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      meeting: data
    });

  } catch (error) {
    console.error('Add note error:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
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
      action_item: data
    });

  } catch (error) {
    console.error('Update action item error:', error);
    return NextResponse.json(
      { error: 'Failed to update action item' },
      { status: 500 }
    );
  }
}

async function markInsightReviewed(insightId: string) {
  try {
    const { data, error } = await supabase
      .from('meeting_insights')
      .update({ 
        reviewed: true,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', insightId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      insight: data
    });

  } catch (error) {
    console.error('Mark insight reviewed error:', error);
    return NextResponse.json(
      { error: 'Failed to mark insight as reviewed' },
      { status: 500 }
    );
  }
}