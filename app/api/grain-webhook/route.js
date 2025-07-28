import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const webhookData = await request.json();
    
    console.log('🎥 Received Grain webhook:', webhookData.event || 'unknown_event');
    
    // Process different Grain webhook events
    switch (webhookData.event) {
      case 'meeting.recorded':
        return await handleMeetingRecorded(webhookData);
      case 'meeting.transcribed':
        return await handleMeetingTranscribed(webhookData);
      case 'meeting.shared':
        return await handleMeetingShared(webhookData);
      default:
        console.log('📝 Unhandled Grain event:', webhookData.event);
        return Response.json({ 
          success: true,
          message: `Event ${webhookData.event} logged but not processed`,
          timestamp: new Date().toISOString()
        });
    }
    
  } catch (error) {
    console.error('❌ Grain webhook error:', error);
    return Response.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleMeetingRecorded(data) {
  try {
    console.log('🎬 Processing recorded meeting:', data.meeting?.title);
    
    // Extract meeting data from Grain webhook
    const meetingData = extractMeetingData(data);
    
    // Save basic meeting record to database
    const { data: savedMeeting, error } = await supabase
      .from('meetings')
      .upsert({
        grain_meeting_id: meetingData.grain_meeting_id,
        title: meetingData.title,
        customer_name: meetingData.customer_name,
        meeting_date: meetingData.meeting_date,
        duration_minutes: meetingData.duration_minutes,
        attendees: meetingData.attendees,
        organizer_email: meetingData.organizer_email,
        meeting_type: meetingData.meeting_type,
        recording_url: meetingData.recording_url,
        grain_share_url: meetingData.grain_share_url,
        status: 'recorded',
        processing_stage: 'initial',
        metadata: meetingData.metadata
      }, {
        onConflict: 'grain_meeting_id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send Slack notification about new meeting
    await notifyNewMeeting(savedMeeting);

    console.log('✅ Meeting recorded and saved:', savedMeeting.id);
    
    return Response.json({
      success: true,
      message: 'Meeting recorded and saved',
      meeting_id: savedMeeting.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to process recorded meeting:', error);
    throw error;
  }
}

async function handleMeetingTranscribed(data) {
  try {
    console.log('📝 Processing transcribed meeting:', data.meeting?.title);
    
    const grainMeetingId = data.meeting?.id || data.meeting_id;
    
    // Update meeting with transcript
    const { data: meeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        transcript_url: data.meeting?.transcript_url,
        full_transcript: data.meeting?.transcript,
        status: 'transcribed',
        processing_stage: 'transcribing'
      })
      .eq('grain_meeting_id', grainMeetingId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Trigger AI analysis of the transcript
    console.log('🤖 Starting AI analysis of meeting content...');
    await analyzeMeetingWithAI(meeting);

    return Response.json({
      success: true,
      message: 'Meeting transcribed and AI analysis initiated',
      meeting_id: meeting.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to process transcribed meeting:', error);
    throw error;
  }
}

async function handleMeetingShared(data) {
  try {
    console.log('🔗 Processing shared meeting:', data.meeting?.title);
    
    const grainMeetingId = data.meeting?.id || data.meeting_id;
    
    // Update meeting with share URL
    const { error } = await supabase
      .from('meetings')
      .update({
        grain_share_url: data.meeting?.share_url
      })
      .eq('grain_meeting_id', grainMeetingId);

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
      message: 'Meeting share URL updated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to process shared meeting:', error);
    throw error;
  }
}

async function analyzeMeetingWithAI(meeting) {
  try {
    // Import AI provider
    const AIProvider = require('../../../lib/ai-provider.js');
    const aiProvider = new AIProvider();
    
    // Prepare meeting data for analysis
    const analysisData = {
      title: meeting.title,
      customer: meeting.customer_name,
      duration: `${meeting.duration_minutes} minutes`,
      attendees: meeting.attendees || [],
      transcript: meeting.full_transcript,
      meetingType: meeting.meeting_type
    };
    
    console.log('🧠 Analyzing meeting with AI...');
    const analysis = await aiProvider.analyzeMeetingContent(analysisData);
    
    // Update meeting with AI analysis results
    await supabase
      .from('meetings')
      .update({
        sentiment_score: analysis.overall_analysis.sentiment_score,
        sentiment_label: analysis.overall_analysis.sentiment_label,
        confidence_score: analysis.overall_analysis.confidence_score,
        meeting_summary: analysis.overall_analysis.summary,
        status: 'analyzed',
        processing_stage: 'complete',
        analyzed_at: new Date().toISOString()
      })
      .eq('id', meeting.id);

    // Save insights to database
    await saveInsightsToDatabase(meeting.id, analysis);
    
    // Create JIRA tickets for feature requests
    await createJiraTicketsForFeatures(analysis.feature_requests, meeting);
    
    // Send Slack notification with key insights
    await notifyMeetingAnalyzed(meeting, analysis);
    
    console.log('✅ Meeting AI analysis completed:', meeting.id);
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // Update meeting status to indicate analysis failure
    await supabase
      .from('meetings')
      .update({
        status: 'transcribed',
        processing_stage: 'analysis_failed',
        metadata: {
          ...meeting.metadata,
          analysis_error: error.message,
          analysis_failed_at: new Date().toISOString()
        }
      })
      .eq('id', meeting.id);
  }
}

async function saveInsightsToDatabase(meetingId, analysis) {
  try {
    // Save meeting insights
    if (analysis.insights && analysis.insights.length > 0) {
      const insights = analysis.insights.map(insight => ({
        meeting_id: meetingId,
        insight_type: insight.type,
        category: insight.category,
        title: insight.title,
        description: insight.description,
        quote: insight.quote,
        importance_score: insight.importance_score,
        confidence_score: insight.confidence_score,
        priority: insight.priority,
        tags: insight.tags || [],
        affected_feature: insight.affected_feature,
        competitor_mentioned: insight.competitor_mentioned
      }));

      await supabase.from('meeting_insights').insert(insights);
    }

    // Save action items
    if (analysis.action_items && analysis.action_items.length > 0) {
      const actionItems = analysis.action_items.map(item => ({
        meeting_id: meetingId,
        description: item.description,
        assigned_to: item.assigned_to,
        priority: item.priority,
        category: item.category,
        due_date: getDueDateFromTimeframe(item.due_timeframe)
      }));

      await supabase.from('meeting_action_items').insert(actionItems);
    }

    // Save feature requests
    if (analysis.feature_requests && analysis.feature_requests.length > 0) {
      const featureRequests = analysis.feature_requests.map(request => ({
        meeting_id: meetingId,
        feature_title: request.title,
        feature_description: request.description,
        business_value: request.business_value,
        urgency: request.urgency,
        customer_pain_point: request.customer_pain_point,
        estimated_impact: request.estimated_impact
      }));

      await supabase.from('meeting_feature_requests').insert(featureRequests);
    }

    // Save competitive intelligence
    if (analysis.competitive_intelligence && analysis.competitive_intelligence.length > 0) {
      const competitiveIntel = analysis.competitive_intelligence.map(intel => ({
        meeting_id: meetingId,
        competitor_name: intel.competitor,
        mention_type: intel.mention_type,
        context: intel.context,
        sentiment: intel.sentiment,
        threat_level: intel.threat_level,
        quote: intel.quote
      }));

      await supabase.from('meeting_competitive_intel').insert(competitiveIntel);
    }

    // Save topics discussed
    if (analysis.topics_discussed && analysis.topics_discussed.length > 0) {
      const topics = analysis.topics_discussed.map(topic => ({
        meeting_id: meetingId,
        topic: topic.topic,
        topic_category: topic.category,
        relevance_score: topic.relevance_score,
        sentiment_score: topic.sentiment === 'positive' ? 0.7 : topic.sentiment === 'negative' ? -0.7 : 0,
        keywords: topic.keywords || []
      }));

      await supabase.from('meeting_topics').insert(topics);
    }

    // Save meeting outcome
    await supabase.from('meeting_outcomes').insert({
      meeting_id: meetingId,
      outcome_type: analysis.overall_analysis.meeting_outcome,
      outcome_result: analysis.overall_analysis.sentiment_label,
      customer_satisfaction: analysis.customer_health.satisfaction_level,
      churn_risk_indicator: analysis.customer_health.churn_risk,
      expansion_opportunity: analysis.customer_health.expansion_opportunity
    });

    console.log('💾 All meeting insights saved to database');
    
  } catch (error) {
    console.error('Failed to save insights to database:', error);
  }
}

function extractMeetingData(webhookData) {
  const meeting = webhookData.meeting || {};
  
  return {
    grain_meeting_id: meeting.id || webhookData.meeting_id,
    title: meeting.title || 'Untitled Meeting',
    customer_name: extractCustomerName(meeting),
    meeting_date: meeting.started_at || meeting.created_at || new Date().toISOString(),
    duration_minutes: meeting.duration ? Math.round(meeting.duration / 60) : null,
    attendees: meeting.attendees || [],
    organizer_email: meeting.organizer?.email,
    meeting_type: inferMeetingType(meeting.title),
    recording_url: meeting.recording_url,
    grain_share_url: meeting.share_url,
    metadata: {
      grain_workspace: webhookData.workspace?.name,
      grain_meeting_type: meeting.type,
      original_webhook_data: webhookData
    }
  };
}

function extractCustomerName(meeting) {
  // Try to extract customer name from meeting title
  const title = meeting.title || '';
  
  // Look for patterns like "Demo - CustomerName" or "CustomerName - Meeting"
  const patterns = [
    /(?:demo|call|meeting)\s*[-–]\s*([^-–]+)/i,
    /([^-–]+?)\s*[-–]\s*(?:demo|call|meeting|qbr)/i,
    /with\s+([^-–(]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // Fallback: look for external attendees
  const externalAttendees = meeting.attendees?.filter(a => 
    !a.email?.includes('@company.com') && // Replace with your company domain
    !a.email?.includes('@yourdomain.com')
  );
  
  if (externalAttendees && externalAttendees.length > 0) {
    // Extract company from email domain
    const email = externalAttendees[0].email;
    if (email) {
      const domain = email.split('@')[1];
      return domain.split('.')[0];
    }
  }
  
  return 'Unknown Customer';
}

function inferMeetingType(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('demo')) return 'demo';
  if (titleLower.includes('qbr') || titleLower.includes('quarterly')) return 'qbr';
  if (titleLower.includes('support') || titleLower.includes('issue')) return 'support';
  if (titleLower.includes('discovery') || titleLower.includes('intro')) return 'discovery';
  if (titleLower.includes('onboarding') || titleLower.includes('kickoff')) return 'onboarding';
  if (titleLower.includes('training')) return 'training';
  
  return 'general';
}

function getDueDateFromTimeframe(timeframe) {
  const now = new Date();
  
  switch (timeframe) {
    case 'immediate':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    case 'this_week':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    case 'this_month':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    default:
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks default
  }
}

async function createJiraTicketsForFeatures(featureRequests, meeting) {
  // This would integrate with JIRA API to create tickets
  // For now, we'll just log the feature requests
  console.log(`📋 ${featureRequests.length} feature requests identified in ${meeting.title}`);
  
  featureRequests.forEach((request, index) => {
    console.log(`  ${index + 1}. ${request.title} (${request.urgency} priority)`);
  });
}

async function notifyNewMeeting(meeting) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        message: `🎥 New meeting recorded: ${meeting.title} with ${meeting.customer_name}`,
        type: 'info',
        metadata: {
          meeting_id: meeting.id,
          customer: meeting.customer_name,
          duration: meeting.duration_minutes
        }
      })
    });
  } catch (error) {
    console.warn('Failed to send Slack notification:', error);
  }
}

async function notifyMeetingAnalyzed(meeting, analysis) {
  try {
    const keyInsights = analysis.insights.filter(i => i.priority === 'high' || i.priority === 'critical');
    const featureRequests = analysis.feature_requests.length;
    const competitorMentions = analysis.competitive_intelligence.length;
    
    let message = `🧠 Meeting analyzed: ${meeting.title}\n`;
    message += `Sentiment: ${analysis.overall_analysis.sentiment_label} (${(analysis.overall_analysis.sentiment_score * 100).toFixed(0)}%)\n`;
    
    if (keyInsights.length > 0) message += `⚡ ${keyInsights.length} high-priority insights\n`;
    if (featureRequests > 0) message += `💡 ${featureRequests} feature requests\n`;
    if (competitorMentions > 0) message += `🏢 ${competitorMentions} competitive mentions\n`;

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        message,
        type: 'success',
        metadata: {
          meeting_id: meeting.id,
          sentiment: analysis.overall_analysis.sentiment_label,
          insights_count: keyInsights.length
        }
      })
    });
  } catch (error) {
    console.warn('Failed to send analysis notification:', error);
  }
}

export async function GET() {
  return Response.json({ 
    message: 'Grain webhook endpoint is active - Enhanced version with AI analysis',
    timestamp: new Date().toISOString(),
    features: [
      'Meeting recording processing',
      'AI-powered transcript analysis', 
      'Automatic insight extraction',
      'Feature request detection',
      'Competitive intelligence tracking',
      'Slack notifications',
      'Database storage'
    ]
  });
}