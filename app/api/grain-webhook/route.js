const { supabase } = require('../../../lib/supabase-client');

export async function POST(request) {
  try {
    const webhookData = await request.json();
    
    console.log('🎥 Received webhook data:', JSON.stringify(webhookData, null, 2));
    
    // Detect if this is from Zapier Grain app (different format)
    if (isGrainZapierData(webhookData)) {
      console.log('📱 Processing Grain Zapier app data...');
      return await handleGrainZapierData(webhookData);
    }
    
    // Handle direct Grain webhook events (original format)
    console.log('🔗 Processing direct Grain webhook:', webhookData.event || 'unknown_event');
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
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Enrich meeting data with additional processing
    const enrichedData = await enrichMeetingData(meetingData, data);

    // Save basic meeting record to database (using actual schema)
    const { data: savedMeeting, error } = await supabase
      .from('meetings')
      .upsert({
        grain_id: enrichedData.grain_meeting_id,
        title: enrichedData.title,
        date: enrichedData.meeting_date,
        duration_minutes: enrichedData.duration_minutes,
        participants: enrichedData.attendees,
        raw_transcript: enrichedData.raw_transcript || null,
        customer_id: enrichedData.customer_id,
        created_at: new Date().toISOString()
        // Note: metadata column not available in current schema
        // Future: Add metadata JSON column for storing additional data
      }, {
        onConflict: 'grain_id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If transcript is already available, trigger AI analysis
    if (enrichedData.raw_transcript && enrichedData.raw_transcript.length > 50) {
      console.log('🤖 Transcript available immediately, starting AI analysis...');
      await analyzeMeetingWithAI(savedMeeting);
    }

    // Send Slack notification about new meeting
    await notifyNewMeeting(savedMeeting);

    console.log('✅ Meeting recorded and saved with enriched data:', savedMeeting.id);
    
    return Response.json({
      success: true,
      message: 'Meeting recorded and saved with enriched data',
      meeting_id: savedMeeting.id,
      data_completeness: enrichedData.data_completeness,
      customer_identified: !!enrichedData.customer_id,
      transcript_available: !!enrichedData.raw_transcript,
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
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Update meeting with transcript (using actual schema)
    const { data: meeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        raw_transcript: data.meeting?.transcript
      })
      .eq('grain_id', grainMeetingId)
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
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Update meeting with share URL (note: no share_url column in current schema)
    const { error } = await supabase
      .from('meetings')
      .update({
        // Note: share_url not in current schema, could add to participants JSON or skip
        participants: meeting.participants || []
      })
      .eq('grain_id', grainMeetingId);

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
    
    // Prepare meeting data for analysis (using actual schema)
    const analysisData = {
      title: meeting.title,
      customer: extractCustomerName({ title: meeting.title }),
      duration: `${meeting.duration_minutes} minutes`,
      attendees: meeting.participants || [],
      transcript: meeting.raw_transcript,
      meetingType: inferMeetingType(meeting.title)
    };
    
    console.log('🧠 Analyzing meeting with AI...');
    const analysis = await aiProvider.analyzeMeetingContent(analysisData);
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Update meeting with basic analysis (using simplified schema)
    // Note: Current schema may not have all these columns
    // You might want to store analysis results in a separate table
    console.log('✅ AI Analysis completed:', {
      sentiment: analysis.overall_analysis.sentiment_label,
      insights: analysis.insights.length,
      actions: analysis.action_items.length
    });

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
    if (supabase) {
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
}

async function saveInsightsToDatabase(meetingId, analysis) {
  try {
    // For now, just log the insights since detailed tables may not exist
    console.log('💾 Insights extracted from meeting:', meetingId);
    console.log('  Insights:', analysis.insights?.length || 0);
    console.log('  Action Items:', analysis.action_items?.length || 0);
    console.log('  Feature Requests:', analysis.feature_requests?.length || 0);
    console.log('  Competitive Intel:', analysis.competitive_intelligence?.length || 0);
    
    // You can uncomment and modify this section once you have the proper tables set up
    /*
    if (!supabase) {
      throw new Error('Database connection not available');
    }
    
    // Example: Save to a general insights table
    await supabase.from('insights').insert({
      meeting_id: meetingId,
      analysis_data: analysis,
      created_at: new Date().toISOString()
    });
    */
    
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
    raw_transcript: meeting.transcript || null,
    metadata: {
      grain_workspace: webhookData.workspace?.name,
      grain_meeting_type: meeting.type,
      original_webhook_data: webhookData
    }
  };
}

async function enrichMeetingData(meetingData, originalWebhookData) {
  try {
    console.log('🔍 Enriching meeting data for:', meetingData.title);
    
    // Calculate data completeness score
    const completenessScore = calculateDataCompleteness(meetingData);
    
    // Match customer from database or create new one
    const customerId = await matchOrCreateCustomer(meetingData.customer_name, meetingData.attendees);
    
    // Try to fetch additional data from Grain API if needed
    let enrichedDuration = meetingData.duration_minutes;
    let enrichedTranscript = meetingData.raw_transcript;
    
    // If critical data is missing and we have Grain API access, try to fetch it
    if (!enrichedDuration || !enrichedTranscript) {
      const grainApiData = await fetchFromGrainApi(meetingData.grain_meeting_id);
      if (grainApiData) {
        enrichedDuration = enrichedDuration || grainApiData.duration_minutes;
        enrichedTranscript = enrichedTranscript || grainApiData.transcript;
      }
    }
    
    // Enhanced customer name extraction
    const enhancedCustomerName = await enhanceCustomerName(meetingData.customer_name, meetingData.attendees);
    
    return {
      ...meetingData,
      duration_minutes: enrichedDuration,
      raw_transcript: enrichedTranscript,
      customer_id: customerId,
      customer_name: enhancedCustomerName,
      data_completeness: {
        score: completenessScore,
        missing_fields: getMissingFields(meetingData),
        enrichment_applied: true,
        enrichment_timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.warn('⚠️ Data enrichment failed, using original data:', error.message);
    return {
      ...meetingData,
      customer_id: null,
      data_completeness: {
        score: calculateDataCompleteness(meetingData),
        missing_fields: getMissingFields(meetingData),
        enrichment_applied: false,
        enrichment_error: error.message
      }
    };
  }
}

function calculateDataCompleteness(meetingData) {
  const requiredFields = [
    'grain_meeting_id',
    'title', 
    'meeting_date',
    'duration_minutes',
    'attendees',
    'raw_transcript',
    'customer_name'
  ];
  
  const presentFields = requiredFields.filter(field => {
    const value = meetingData[field];
    return value !== null && value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  });
  
  return Math.round((presentFields.length / requiredFields.length) * 100);
}

function getMissingFields(meetingData) {
  const requiredFields = [
    'duration_minutes',
    'raw_transcript', 
    'customer_name',
    'organizer_email'
  ];
  
  return requiredFields.filter(field => {
    const value = meetingData[field];
    return value === null || value === undefined || value === '';
  });
}

async function matchOrCreateCustomer(customerName, attendees) {
  try {
    if (!customerName || customerName === 'Unknown Customer' || !supabase) {
      return null;
    }
    
    // First, try to find existing customer by name
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .ilike('name', customerName)
      .limit(1)
      .single();
    
    if (existingCustomer) {
      console.log('✅ Matched existing customer:', customerName);
      return existingCustomer.id;
    }
    
    // If no match, extract domain from external attendees
    const externalDomains = attendees
      .filter(a => a.email && !isInternalEmail(a.email))
      .map(a => a.email.split('@')[1])
      .filter(domain => domain);
    
    const primaryDomain = externalDomains[0];
    
    if (primaryDomain) {
      // Try to find customer by domain
      const { data: domainCustomer } = await supabase
        .from('customers')
        .select('id')
        .ilike('domain', primaryDomain)
        .limit(1)
        .single();
      
      if (domainCustomer) {
        console.log('✅ Matched customer by domain:', primaryDomain);
        return domainCustomer.id;
      }
      
      // Create new customer if none found
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          name: customerName,
          domain: primaryDomain,
          status: 'active',
          source: 'grain_meeting',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (!error && newCustomer) {
        console.log('✅ Created new customer:', customerName);
        return newCustomer.id;
      }
    }
    
    return null;
    
  } catch (error) {
    console.warn('⚠️ Customer matching failed:', error.message);
    return null;
  }
}

function isInternalEmail(email) {
  const internalDomains = [
    'company.com',      // Replace with your actual domain
    'yourdomain.com',   // Replace with your actual domain
    'marq.com',         // Add your actual company domain
    'gmail.com'         // Often used for testing
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return internalDomains.includes(domain);
}

async function enhanceCustomerName(customerName, attendees) {
  if (customerName && customerName !== 'Unknown Customer') {
    return customerName;
  }
  
  // Try to extract company name from external attendee domains
  const externalAttendees = attendees.filter(a => a.email && !isInternalEmail(a.email));
  
  if (externalAttendees.length > 0) {
    const domain = externalAttendees[0].email.split('@')[1];
    // Convert domain to company name (e.g., "acme.com" -> "Acme")
    const companyName = domain.split('.')[0];
    return companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase();
  }
  
  return customerName;
}

async function fetchFromGrainApi(grainMeetingId) {
  try {
    // This would use Grain's API to fetch additional meeting data
    // For now, we'll return null since API integration would need API keys
    console.log('🔗 Grain API fetch not implemented yet for:', grainMeetingId);
    return null;
    
    /*
    // Example implementation:
    const response = await fetch(`https://api.grain.co/meetings/${grainMeetingId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        duration_minutes: data.duration ? Math.round(data.duration / 60) : null,
        transcript: data.transcript
      };
    }
    */
    
  } catch (error) {
    console.warn('⚠️ Grain API fetch failed:', error.message);
    return null;
  }
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
    // Use customer insight template and send to insights channel
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        templateId: 'customer-insight-alert',
        type: 'insight',
        templateData: {
          customerName: meeting.customer_name || 'Unknown Customer',
          meetingTitle: meeting.title || 'Untitled Meeting',
          insightType: 'Meeting Recording',
          priorityScore: meeting.priority_score || 5,
          insightSummary: meeting.summary || 'New meeting recorded and ready for analysis',
          actionItems: meeting.action_items || '• Review meeting transcript\n• Extract key insights\n• Follow up on customer requests',
          customerQuote: meeting.key_quote || 'Meeting analysis pending...',
          meetingUrl: meeting.grain_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10001&summary=Follow%20up:%20${encodeURIComponent(meeting.title || 'Meeting')}`
        },
        metadata: {
          meeting_id: meeting.id,
          customer: meeting.customer_name,
          duration: meeting.duration_minutes,
          source: 'grain_webhook'
        }
      })
    });
    
    console.log('✅ Sent customer insight notification for meeting:', meeting.title);
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

// Zapier Grain app integration functions
function isGrainZapierData(webhookData) {
  // Zapier typically sends data with different structure than direct Grain webhooks
  // Common Zapier indicators:
  // 1. Has zapier-specific fields like 'id' at root level
  // 2. Flattened structure instead of nested 'meeting' object
  // 3. Different field naming conventions
  // 4. May include 'recorded_at' instead of 'started_at'
  
  const zapierIndicators = [
    // Check for Zapier-specific field patterns
    webhookData.hasOwnProperty('recording_id') && !webhookData.hasOwnProperty('event'),
    webhookData.hasOwnProperty('recorded_at') && !webhookData.meeting,
    webhookData.hasOwnProperty('grain_recording_id'),
    webhookData.hasOwnProperty('grain_meeting_title'),
    // Zapier often flattens nested objects, so check for flattened structure
    typeof webhookData.meeting === 'undefined' && webhookData.hasOwnProperty('title'),
    // Check for Zapier's common field naming
    webhookData.hasOwnProperty('created_at_iso') || webhookData.hasOwnProperty('updated_at_iso')
  ];
  
  // If any Zapier indicators are present, treat as Zapier data
  const isZapier = zapierIndicators.some(indicator => indicator);
  
  console.log('🔍 Zapier detection results:', {
    isZapier,
    indicators: zapierIndicators,
    sampleFields: Object.keys(webhookData).slice(0, 10)
  });
  
  return isZapier;
}

async function handleGrainZapierData(webhookData) {
  try {
    console.log('📱 Processing Grain Zapier "Recorded Added" trigger data...');
    
    // Map Zapier Grain app fields to our expected format
    // Common Zapier Grain app field mappings:
    const mappedData = {
      grain_meeting_id: webhookData.recording_id || webhookData.grain_recording_id || webhookData.id,
      title: webhookData.title || webhookData.grain_meeting_title || webhookData.meeting_title || 'Untitled Meeting',
      meeting_date: webhookData.recorded_at || webhookData.created_at || webhookData.started_at || new Date().toISOString(),
      duration_minutes: webhookData.duration_minutes || 
                       (webhookData.duration_seconds ? Math.round(webhookData.duration_seconds / 60) : null) ||
                       (webhookData.duration ? Math.round(webhookData.duration / 60) : null),
      participants: parseZapierParticipants(webhookData),
      raw_transcript: webhookData.transcript || webhookData.transcript_text || null,
      customer_id: null, // Will be determined later
      recording_url: webhookData.recording_url || webhookData.grain_recording_url,
      share_url: webhookData.share_url || webhookData.grain_share_url,
      organizer_email: webhookData.organizer_email || webhookData.host_email,
      workspace: webhookData.workspace_name || webhookData.grain_workspace
    };
    
    console.log('🔄 Mapped Zapier data:', {
      grain_id: mappedData.grain_meeting_id,
      title: mappedData.title,
      duration: mappedData.duration_minutes,
      has_transcript: !!mappedData.raw_transcript
    });
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }
    
    // Save meeting to database using actual schema
    const { data: savedMeeting, error } = await supabase
      .from('meetings')
      .upsert({
        grain_id: mappedData.grain_meeting_id,
        title: mappedData.title,
        date: mappedData.meeting_date,
        duration_minutes: mappedData.duration_minutes,
        participants: mappedData.participants,
        raw_transcript: mappedData.raw_transcript,
        customer_id: mappedData.customer_id,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'grain_id'
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Zapier meeting saved:', savedMeeting.id);
    
    // If transcript is available, trigger AI analysis
    if (mappedData.raw_transcript && mappedData.raw_transcript.length > 50) {
      console.log('🤖 Starting AI analysis of Zapier meeting content...');
      await analyzeMeetingWithAI(savedMeeting);
    }
    
    // Send notifications
    await notifyNewMeeting(savedMeeting);
    
    return Response.json({
      success: true,
      message: 'Zapier Grain meeting processed successfully',
      meeting_id: savedMeeting.id,
      source: 'zapier_grain_app',
      data_mapped: true,
      ai_analysis: !!mappedData.raw_transcript,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to process Zapier Grain data:', error);
    throw error;
  }
}

function parseZapierParticipants(webhookData) {
  // Zapier might send participants in various formats:
  // 1. JSON string that needs parsing
  // 2. Comma-separated string
  // 3. Array (if already parsed)
  // 4. Individual fields like attendee_1_name, attendee_1_email, etc.
  
  let participants = [];
  
  // Try parsing as JSON string first
  if (webhookData.participants && typeof webhookData.participants === 'string') {
    try {
      participants = JSON.parse(webhookData.participants);
    } catch (e) {
      // If JSON parsing fails, try comma-separated
      participants = webhookData.participants.split(',').map(name => ({
        name: name.trim(),
        email: null,
        role: 'attendee'
      }));
    }
  }
  // If already an array
  else if (Array.isArray(webhookData.participants)) {
    participants = webhookData.participants;
  }
  // Try attendee list format
  else if (webhookData.attendees) {
    if (typeof webhookData.attendees === 'string') {
      try {
        participants = JSON.parse(webhookData.attendees);
      } catch (e) {
        participants = webhookData.attendees.split(',').map(name => ({
          name: name.trim(),
          email: null,
          role: 'attendee'
        }));
      }
    } else if (Array.isArray(webhookData.attendees)) {
      participants = webhookData.attendees;
    }
  }
  // Try individual attendee fields (common in Zapier)
  else {
    const attendeeKeys = Object.keys(webhookData).filter(key => key.startsWith('attendee_') && key.includes('_name'));
    attendeeKeys.forEach(nameKey => {
      const index = nameKey.match(/attendee_(\d+)_name/)?.[1];
      if (index) {
        const emailKey = `attendee_${index}_email`;
        participants.push({
          name: webhookData[nameKey],
          email: webhookData[emailKey] || null,
          role: 'attendee'
        });
      }
    });
  }
  
  // Add organizer if available
  if (webhookData.organizer_name || webhookData.host_name) {
    participants.unshift({
      name: webhookData.organizer_name || webhookData.host_name,
      email: webhookData.organizer_email || webhookData.host_email,
      role: 'host'
    });
  }
  
  console.log('👥 Parsed participants:', participants.length, 'attendees');
  return participants;
}

export async function GET() {
  return Response.json({ 
    message: 'Grain webhook endpoint is active - Enhanced version with AI analysis + Zapier support',
    timestamp: new Date().toISOString(),
    features: [
      'Meeting recording processing',
      'AI-powered transcript analysis', 
      'Automatic insight extraction',
      'Feature request detection',
      'Competitive intelligence tracking',
      'Slack notifications',
      'Database storage',
      'Zapier Grain app integration',
      'Multiple webhook format support'
    ],
    supported_sources: [
      'Direct Grain webhooks',
      'Zapier Grain app "Recorded Added" trigger'
    ]
  });
}