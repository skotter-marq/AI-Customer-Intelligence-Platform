import { createClient } from '@supabase/supabase-js';

// Create supabase client with error handling
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables missing:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      key: supabaseKey ? 'SET' : 'MISSING'
    });
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const supabase = createSupabaseClient();

export async function GET() {
  return Response.json({ 
    status: 'Grain webhook endpoint is active',
    supabase: supabase ? 'Connected' : 'Not connected',
    env_vars: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      anthropic_key: process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING',
      base_url: process.env.NEXT_PUBLIC_BASE_URL ? 'SET' : 'MISSING'
    },
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  console.log('🎥 POST request received to grain webhook');
  try {
    console.log('🔍 Parsing JSON data...');
    const webhookData = await request.json();
    
    console.log('🎥 Received webhook data:', JSON.stringify(webhookData, null, 2));
    console.log('🔍 Supabase client status:', supabase ? 'Available' : 'Not available');
    
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

    // Only send notifications for product-relevant meetings (handled after AI analysis)

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
    const AIProviderModule = await import('../../../lib/ai-provider.js');
    const AIProvider = AIProviderModule.default;
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
    
    console.log('🧠 Starting comprehensive AI analysis...');
    
    // Use the comprehensive meeting analysis prompt
    const comprehensiveAnalysis = await runAIPrompt('comprehensive-meeting-analysis', {
      customer_name: analysisData.customer,
      meeting_type: analysisData.meetingType,
      meeting_date: analysisData.date,
      duration_minutes: analysisData.duration_minutes,
      participants: JSON.stringify(analysisData.participants),
      transcript: analysisData.transcript
    });
    
    // Run specialized analyses in parallel for deeper insights
    const [sentimentAnalysis, featureAnalysis, competitiveAnalysis] = await Promise.allSettled([
      runAIPrompt('meeting-sentiment-analysis', {
        customer_name: analysisData.customer,
        meeting_type: analysisData.meetingType,
        interaction_history: 'Previous meetings logged in system', // TODO: Get actual history
        transcript: analysisData.transcript
      }),
      runAIPrompt('feature-request-prioritization', {
        customer_name: analysisData.customer,
        customer_segment: 'Enterprise', // TODO: Get actual segment from customer data
        customer_arr: '$100k+', // TODO: Get actual ARR from customer data
        meeting_type: analysisData.meetingType,
        transcript: analysisData.transcript
      }),
      runAIPrompt('competitive-intelligence-analysis', {
        customer_name: analysisData.customer,
        meeting_type: analysisData.meetingType,
        sales_stage: 'Discovery', // TODO: Get actual stage from CRM
        known_competitors: 'Canva, Adobe, Figma', // TODO: Get from competitive database
        transcript: analysisData.transcript
      })
    ]);
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Update meeting with comprehensive analysis results
    if (comprehensiveAnalysis?.overall_analysis) {
      await supabase
        .from('meetings')
        .update({
          sentiment_score: comprehensiveAnalysis.overall_analysis.sentiment_score,
          sentiment_label: comprehensiveAnalysis.overall_analysis.sentiment_label,
          confidence_score: comprehensiveAnalysis.overall_analysis.confidence_score,
          meeting_summary: comprehensiveAnalysis.overall_analysis.meeting_summary,
          status: 'analyzed',
          processing_stage: 'complete',
          analyzed_at: new Date().toISOString(),
          metadata: {
            ...meeting.metadata,
            key_themes: comprehensiveAnalysis.overall_analysis.key_themes,
            customer_health_score: comprehensiveAnalysis.overall_analysis.customer_health_score,
            business_impact: comprehensiveAnalysis.overall_analysis.business_impact
          }
        })
        .eq('id', meeting.id);
    }

    console.log('✅ Comprehensive AI Analysis completed:', {
      sentiment: comprehensiveAnalysis?.overall_analysis?.sentiment_label,
      insights: comprehensiveAnalysis?.insights?.length || 0,
      actions: comprehensiveAnalysis?.action_items?.length || 0,
      features: comprehensiveAnalysis?.feature_requests?.length || 0,
      competitive: comprehensiveAnalysis?.competitive_intelligence?.length || 0
    });

    // Save comprehensive insights to all intelligence tables
    await saveComprehensiveInsightsToDatabase(meeting.id, {
      comprehensive: comprehensiveAnalysis,
      sentiment: sentimentAnalysis.status === 'fulfilled' ? sentimentAnalysis.value : null,
      features: featureAnalysis.status === 'fulfilled' ? featureAnalysis.value : null,
      competitive: competitiveAnalysis.status === 'fulfilled' ? competitiveAnalysis.value : null
    });
    
    // Create JIRA tickets for high-priority feature requests
    if (comprehensiveAnalysis?.feature_requests) {
      await createJiraTicketsForFeatures(comprehensiveAnalysis.feature_requests, meeting);
    }
    
    // Send product-focused notifications only when actionable insights are found
    await notifyProductInsights(meeting, comprehensiveAnalysis, enrichedData);
    
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

async function notifyProductInsights(meeting, analysis, enrichedData = null) {
  try {
    const customerName = enrichedData?.customer_name || meeting.customer_name || extractCustomerFromMeeting(meeting);
    const meetingType = meeting.meeting_type || inferMeetingType(meeting.title || '');
    
    // Determine if this meeting has product-relevant insights
    const productInsights = analyzeProductRelevance(meeting, analysis, meetingType);
    
    if (!productInsights.shouldNotify) {
      console.log('📵 No product-relevant insights found, skipping notification');
      return;
    }
    
    console.log('📢 Sending product-focused insight notification...');
    
    // Create targeted notification based on insight type
    const notification = createProductNotification(customerName, meeting, productInsights, analysis);
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    
    console.log('✅ Product insight notification sent:', productInsights.primaryInsightType);
  } catch (error) {
    console.warn('Failed to send product insight notification:', error);
  }
}

// Zapier Grain app integration functions
function isGrainZapierData(webhookData) {
  // Enhanced Zapier detection for comprehensive Grain payload
  const zapierIndicators = [
    // Check for Zapier-specific field patterns from your payload
    webhookData.hasOwnProperty('recording_id') && !webhookData.hasOwnProperty('event'),
    webhookData.hasOwnProperty('recording_title') && !webhookData.meeting,
    webhookData.hasOwnProperty('data_owners'),
    webhookData.hasOwnProperty('data_participants'),
    webhookData.hasOwnProperty('data_summary'),
    webhookData.hasOwnProperty('summary_points'),
    webhookData.hasOwnProperty('recording_start_datetime'),
    webhookData.hasOwnProperty('recording_end_datetime'),
    webhookData.hasOwnProperty('data_transcript_json_url'),
    // Zapier often flattens nested objects
    typeof webhookData.meeting === 'undefined' && (webhookData.hasOwnProperty('recording_title') || webhookData.hasOwnProperty('recording_id'))
  ];
  
  // If any Zapier indicators are present, treat as Zapier data
  const isZapier = zapierIndicators.some(indicator => indicator);
  
  console.log('🔍 Enhanced Zapier detection results:', {
    isZapier,
    hasRecordingId: !!webhookData.recording_id,
    hasParticipants: !!webhookData.data_participants,
    hasSummaryPoints: !!webhookData.summary_points,
    hasTranscriptUrl: !!webhookData.data_transcript_json_url,
    sampleFields: Object.keys(webhookData).slice(0, 15)
  });
  
  return isZapier;
}

async function handleGrainZapierData(webhookData) {
  try {
    console.log('📱 Processing comprehensive Grain Zapier data...');
    
    // Calculate actual duration from start/end times
    let durationMinutes = null;
    if (webhookData.recording_start_datetime && webhookData.recording_end_datetime) {
      const startTime = new Date(webhookData.recording_start_datetime);
      const endTime = new Date(webhookData.recording_end_datetime);
      durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    }
    
    // Parse comprehensive participant data
    const participants = parseComprehensiveParticipants(webhookData.data_participants);
    
    // Fetch transcript if URL is provided
    let transcript = null;
    if (webhookData.data_transcript_txt_url) {
      transcript = await fetchTranscriptFromUrl(webhookData.data_transcript_txt_url);
    }
    
    // Map comprehensive Zapier Grain data
    const mappedData = {
      grain_meeting_id: webhookData.recording_id,
      title: webhookData.recording_title || 'Untitled Meeting',
      meeting_date: webhookData.recording_start_datetime || new Date().toISOString(),
      duration_minutes: durationMinutes,
      participants: participants,
      raw_transcript: transcript,
      customer_id: null, // Will be determined during enrichment
      recording_url: webhookData.recording_url,
      share_url: webhookData['recording_viewer-only_url'],
      data_source: webhookData.data_source, // e.g., 'zoom'
      data_summary: webhookData.data_summary,
      summary_points: webhookData.summary_points,
      intelligence_notes: webhookData['recording_intelligence_notes_(markdown)'],
      ical_uid: webhookData.data_ical_uid,
      customer_name: extractCustomerFromParticipants(participants),
      meeting_type: inferMeetingTypeFromSummary(webhookData.data_summary),
      workspace: 'grain_zapier'
    };
    
    console.log('🔄 Mapped comprehensive Zapier data:', {
      grain_id: mappedData.grain_meeting_id,
      title: mappedData.title,
      duration: mappedData.duration_minutes,
      participants_count: mappedData.participants?.length || 0,
      has_transcript: !!mappedData.raw_transcript,
      has_summary: !!mappedData.data_summary,
      has_intelligence: !!mappedData.intelligence_notes,
      customer_identified: mappedData.customer_name
    });
    
    // Enrich the data using our existing enrichment function
    const enrichedData = await enrichMeetingData(mappedData, webhookData);
    
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }
    
    // Save comprehensive meeting to database
    const { data: savedMeeting, error } = await supabase
      .from('meetings')
      .upsert({
        grain_id: enrichedData.grain_meeting_id,
        title: enrichedData.title,
        date: enrichedData.meeting_date,
        duration_minutes: enrichedData.duration_minutes,
        participants: enrichedData.participants,
        raw_transcript: enrichedData.raw_transcript,
        customer_id: enrichedData.customer_id,
        recording_url: enrichedData.recording_url || mappedData.recording_url,
        transcript_url: enrichedData.transcript_url || mappedData.transcript_url,
        grain_share_url: enrichedData.grain_share_url || mappedData.grain_share_url,
        meeting_summary: mappedData.data_summary,
        intelligence_notes: mappedData.intelligence_notes,
        status: 'recorded',
        processing_stage: 'initial',
        meeting_type: detectMeetingType(enrichedData.title),
        organizer_email: extractOrganizerEmail(enrichedData.participants),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'grain_id'
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Comprehensive Zapier meeting saved:', savedMeeting.id);
    
    // If transcript is available OR we have rich intelligence notes, trigger AI analysis
    if ((enrichedData.raw_transcript && enrichedData.raw_transcript.length > 50) || 
        mappedData.intelligence_notes) {
      console.log('🤖 Starting AI analysis with rich Grain data...');
      await analyzeMeetingWithAI(savedMeeting, {
        grain_summary: mappedData.data_summary,
        summary_points: mappedData.summary_points,
        intelligence_notes: mappedData.intelligence_notes
      });
    }
    
    // Product insights notification handled after AI analysis
    
    return Response.json({
      success: true,
      message: 'Comprehensive Zapier Grain meeting processed successfully',
      meeting_id: savedMeeting.id,
      source: 'zapier_grain_comprehensive',
      data_completeness: enrichedData.data_completeness,
      features_extracted: {
        transcript: !!enrichedData.raw_transcript,
        summary: !!mappedData.data_summary,
        intelligence_notes: !!mappedData.intelligence_notes,
        summary_points: mappedData.summary_points?.length || 0,
        participants: mappedData.participants?.length || 0,
        customer_identified: !!enrichedData.customer_id
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to process comprehensive Zapier Grain data:', error);
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

function parseComprehensiveParticipants(dataParticipants) {
  if (!dataParticipants || !Array.isArray(dataParticipants)) {
    return [];
  }
  
  return dataParticipants.map(participant => ({
    id: participant.data_participants_id,
    name: participant.data_participants_name,
    email: participant.data_participants_email,
    scope: participant.data_participants_scope, // 'internal' or 'external'
    confirmed_attendee: participant.data_participants_confirmed_attendee,
    role: participant.data_participants_scope === 'internal' ? 'host' : 'attendee'
  }));
}

function extractCustomerFromParticipants(participants) {
  if (!participants || !Array.isArray(participants)) {
    return 'Unknown Customer';
  }
  
  // Find external participants (customers)
  const externalParticipants = participants.filter(p => 
    p.scope === 'external' || (!isInternalEmail(p.email))
  );
  
  if (externalParticipants.length > 0) {
    // Extract company name from first external participant's email domain
    const email = externalParticipants[0].email;
    if (email) {
      const domain = email.split('@')[1];
      // Convert domain to company name (e.g., "moreheadstate.edu" -> "Morehead State")
      return formatCompanyName(domain);
    }
  }
  
  return 'Unknown Customer';
}

function formatCompanyName(domain) {
  // Handle common domain patterns
  const domainMappings = {
    'moreheadstate.edu': 'Morehead State University',
    'gmail.com': 'Gmail User',
    'outlook.com': 'Outlook User',
    'yahoo.com': 'Yahoo User'
  };
  
  if (domainMappings[domain]) {
    return domainMappings[domain];
  }
  
  // Generic domain to company name conversion
  const companyName = domain.split('.')[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase();
}

function inferMeetingTypeFromSummary(summary) {
  if (!summary) return 'general';
  
  const summaryLower = summary.toLowerCase();
  
  if (summaryLower.includes('single sign-on') || summaryLower.includes('sso')) return 'implementation';
  if (summaryLower.includes('demo') || summaryLower.includes('demonstration')) return 'demo';
  if (summaryLower.includes('training') || summaryLower.includes('onboarding')) return 'training';
  if (summaryLower.includes('support') || summaryLower.includes('troubleshoot')) return 'support';
  if (summaryLower.includes('discovery') || summaryLower.includes('consultation')) return 'discovery';
  if (summaryLower.includes('contract') || summaryLower.includes('agreement')) return 'contract';
  
  return 'general';
}

function detectMeetingType(title) {
  if (!title) return 'general';
  
  const titleLower = title.toLowerCase();
  
  // Common meeting type patterns
  if (titleLower.includes('demo') || titleLower.includes('demonstration')) return 'demo';
  if (titleLower.includes('qbr') || titleLower.includes('quarterly business review') || titleLower.includes('quarterly review')) return 'qbr';
  if (titleLower.includes('support') || titleLower.includes('troubleshoot') || titleLower.includes('issue') || titleLower.includes('problem')) return 'support';
  if (titleLower.includes('discovery') || titleLower.includes('consultation') || titleLower.includes('assessment')) return 'discovery';
  if (titleLower.includes('onboarding') || titleLower.includes('kickoff') || titleLower.includes('implementation')) return 'implementation';
  if (titleLower.includes('training') || titleLower.includes('workshop') || titleLower.includes('tutorial')) return 'training';
  if (titleLower.includes('sales') || titleLower.includes('prospect') || titleLower.includes('pitch')) return 'sales';
  if (titleLower.includes('check-in') || titleLower.includes('checkin') || titleLower.includes('catch up')) return 'check_in';
  if (titleLower.includes('contract') || titleLower.includes('agreement') || titleLower.includes('negotiation')) return 'contract';
  if (titleLower.includes('renewal') || titleLower.includes('expansion') || titleLower.includes('upsell')) return 'renewal';
  
  return 'general';
}

function extractOrganizerEmail(participants) {
  if (!participants || !Array.isArray(participants)) return null;
  
  // Look for internal organizers (company domain patterns)
  const internalDomains = ['marq.com', 'company.com'];
  
  for (const participant of participants) {
    if (participant.email) {
      for (const domain of internalDomains) {
        if (participant.email.includes(domain)) {
          return participant.email;
        }
      }
    }
  }
  
  // If no internal organizer found, return the first participant with an email
  for (const participant of participants) {
    if (participant.email) {
      return participant.email;
    }
  }
  
  return null;
}

async function fetchTranscriptFromUrl(transcriptUrl) {
  try {
    console.log('📥 Fetching transcript from URL:', transcriptUrl);
    
    const response = await fetch(transcriptUrl);
    if (response.ok) {
      const transcript = await response.text();
      console.log(`✅ Transcript fetched: ${transcript.length} characters`);
      return transcript;
    } else {
      console.warn('⚠️ Failed to fetch transcript:', response.status);
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Transcript fetch error:', error.message);
    return null;
  }
}

async function notifyNewMeetingWithGrainData(meeting, grainData) {
  try {
    console.log('📢 Sending enhanced notification with Grain intelligence...');
    
    // Extract key insights from Grain's intelligence notes
    const keyTakeaways = extractKeyTakeaways(grainData.intelligence_notes);
    const actionItems = extractActionItems(grainData.intelligence_notes);
    
    // Use enhanced customer insight template
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        templateId: 'customer-insight-alert',
        type: 'insight',
        templateData: {
          customerName: grainData.customer_name || 'Unknown Customer',
          meetingTitle: meeting.title,
          insightType: 'Grain AI Analysis',
          priorityScore: calculatePriorityFromGrainData(grainData),
          insightSummary: grainData.data_summary || 'Meeting processed with Grain AI intelligence',
          actionItems: actionItems.join('\n• ') || 'No specific action items identified',
          customerQuote: keyTakeaways[0] || 'See Grain recording for details',
          meetingUrl: grainData.share_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10001&summary=Follow%20up:%20${encodeURIComponent(meeting.title)}`
        },
        metadata: {
          meeting_id: meeting.id,
          customer: grainData.customer_name,
          duration: meeting.duration_minutes,
          source: 'grain_zapier_enhanced',
          grain_summary_points: grainData.summary_points?.length || 0,
          has_intelligence_notes: !!grainData.intelligence_notes
        }
      })
    });
    
    console.log('✅ Enhanced Grain notification sent successfully');
  } catch (error) {
    console.warn('Failed to send enhanced Grain notification:', error);
  }
}

function extractKeyTakeaways(intelligenceNotes) {
  if (!intelligenceNotes) return [];
  
  // Extract content from **Key Takeaways** section
  const takeawaysMatch = intelligenceNotes.match(/\*\*Key Takeaways\*\*\s*(.*?)(?:\*\*|$)/s);
  if (takeawaysMatch) {
    const takeawaysText = takeawaysMatch[1];
    // Extract bullet points or numbered items
    const takeaways = takeawaysText.match(/\[(.*?)\]\(.*?\)\s*-\s*(.*?)(?=\n|$)/g);
    return takeaways ? takeaways.map(item => item.replace(/\[.*?\]\(.*?\)\s*-\s*/, '').trim()) : [];
  }
  
  return [];
}

function extractActionItems(intelligenceNotes) {
  if (!intelligenceNotes) return [];
  
  // Extract content from **Action Items** section
  const actionItemsMatch = intelligenceNotes.match(/\*\*Action Items\*\*\s*(.*?)(?:\*\*|$)/s);
  if (actionItemsMatch) {
    const actionItemsText = actionItemsMatch[1];
    // Extract bullet points or action items
    const actions = actionItemsText.match(/\[(.*?)\]\(.*?\)\s*-\s*(.*?)(?=\n|$)/g);
    return actions ? actions.map(item => item.replace(/\[.*?\]\(.*?\)\s*-\s*/, '').trim()) : [];
  }
  
  return [];
}

function calculatePriorityFromGrainData(grainData) {
  let score = 5; // Base priority
  
  // Increase priority based on content
  if (grainData.intelligence_notes) {
    if (grainData.intelligence_notes.toLowerCase().includes('contract')) score += 2;
    if (grainData.intelligence_notes.toLowerCase().includes('urgent')) score += 3;
    if (grainData.intelligence_notes.toLowerCase().includes('implementation')) score += 1;
  }
  
  // Increase based on external participants
  const externalCount = grainData.participants?.filter(p => p.scope === 'external').length || 0;
  if (externalCount > 2) score += 1;
  
  // Increase based on summary points
  if (grainData.summary_points?.length > 3) score += 1;
  
  return Math.min(score, 10); // Cap at 10
}

// Helper functions for improved Slack notifications
function extractCustomerFromMeeting(meeting) {
  if (meeting.customer_name && meeting.customer_name !== 'Unknown Customer') {
    return meeting.customer_name;
  }
  
  // Try to extract from participants
  if (meeting.participants && Array.isArray(meeting.participants)) {
    const externalParticipants = meeting.participants.filter(p => 
      p.email && !isInternalEmail(p.email)
    );
    
    if (externalParticipants.length > 0) {
      const email = externalParticipants[0].email;
      const domain = email.split('@')[1];
      return formatCompanyName(domain);
    }
  }
  
  return 'External Customer';
}

function generateMeetingSummary(meeting, enrichedData) {
  const customerName = enrichedData?.customer_name || meeting.customer_name || 'customer';
  const duration = meeting.duration_minutes || enrichedData?.duration_minutes;
  const participantCount = meeting.participants?.length || 0;
  const hasTranscript = !!(meeting.raw_transcript || enrichedData?.raw_transcript);
  
  let summary = `New meeting with ${customerName}`;
  
  if (duration) summary += ` (${duration} minutes)`;
  if (participantCount > 0) summary += ` involving ${participantCount} participants`;
  if (hasTranscript) summary += `. Transcript available for AI analysis`;
  else summary += `. Transcript processing in progress`;
  
  // Add meeting type context
  const meetingType = meeting.meeting_type || inferMeetingType(meeting.title || '');
  if (meetingType && meetingType !== 'general') {
    summary += `. Meeting type: ${meetingType.replace('_', ' ')}`;
  }
  
  return summary + '.';
}

function generateActionItems(meeting, enrichedData) {
  const actionItems = [];
  const hasTranscript = !!(meeting.raw_transcript || enrichedData?.raw_transcript);
  const customerName = enrichedData?.customer_name || meeting.customer_name || 'customer';
  
  if (hasTranscript) {
    actionItems.push('Review AI-generated meeting insights');
    actionItems.push('Follow up on customer requests and questions');
  } else {
    actionItems.push('Wait for transcript processing to complete');
    actionItems.push('Review meeting recording when available');
  }
  
  actionItems.push(`Update ${customerName} account with meeting notes`);
  
  const meetingType = meeting.meeting_type || inferMeetingType(meeting.title || '');
  switch (meetingType) {
    case 'demo':
      actionItems.push('Schedule follow-up demo if needed');
      actionItems.push('Send demo resources and documentation');
      break;
    case 'support':
      actionItems.push('Create support tickets for identified issues');
      actionItems.push('Follow up on resolution timeline');
      break;
    case 'qbr':
      actionItems.push('Prepare QBR summary and action plan');
      actionItems.push('Schedule next quarterly review');
      break;
    case 'discovery':
      actionItems.push('Document customer requirements and pain points');
      actionItems.push('Prepare proposal based on discovery insights');
      break;
  }
  
  return actionItems.map(item => `• ${item}`).join('\n');
}

function calculateMeetingPriority(meeting, enrichedData) {
  let priority = 5; // Base priority
  
  const customerName = enrichedData?.customer_name || meeting.customer_name || '';
  const title = meeting.title || '';
  const duration = meeting.duration_minutes || enrichedData?.duration_minutes || 0;
  
  // Increase priority based on customer name patterns
  if (customerName.toLowerCase().includes('enterprise') || 
      customerName.toLowerCase().includes('university') ||
      customerName.toLowerCase().includes('corp')) {
    priority += 2;
  }
  
  // Increase priority based on meeting type
  const meetingType = meeting.meeting_type || inferMeetingType(title);
  switch (meetingType) {
    case 'qbr': priority += 3; break;
    case 'support': priority += 2; break;
    case 'demo': priority += 1; break;
  }
  
  // Increase priority for longer meetings (indicates importance)
  if (duration > 45) priority += 2;
  else if (duration > 30) priority += 1;
  
  // Increase priority if multiple external participants
  const externalCount = meeting.participants?.filter(p => 
    p.email && !isInternalEmail(p.email)
  ).length || 0;
  if (externalCount > 2) priority += 1;
  
  return Math.min(priority, 10);
}

function extractMeetingQuote(meeting) {
  // Try to extract a meaningful quote or first line from transcript
  const transcript = meeting.raw_transcript;
  if (transcript && transcript.length > 50) {
    // Extract first customer speaking line (basic heuristic)
    const lines = transcript.split('\n').filter(line => line.trim().length > 20);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^\d+:\d+\s*/, '').replace(/^[^:]+:\s*/, '').trim();
      return firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine;
    }
  }
  
  return `Meeting scheduled regarding: ${meeting.title || 'customer discussion'}`;
}

// Product-focused notification intelligence
function analyzeProductRelevance(meeting, analysis, meetingType) {
  const insights = {
    shouldNotify: false,
    primaryInsightType: null,
    featureRequests: [],
    technicalIssues: [],
    competitiveIntel: [],
    usabilityFeedback: [],
    priorityScore: 0
  };
  
  // Always notify for Discovery and Support/Troubleshooting meetings
  const productRelevantTypes = ['discovery', 'support', 'troubleshooting', 'technical'];
  if (productRelevantTypes.includes(meetingType)) {
    insights.shouldNotify = true;
    insights.primaryInsightType = meetingType;
    insights.priorityScore += 3;
  }
  
  // Analyze AI insights for product-relevant content
  if (analysis?.feature_requests && analysis.feature_requests.length > 0) {
    insights.shouldNotify = true;
    insights.featureRequests = analysis.feature_requests.filter(req => 
      req.priority === 'high' || req.priority === 'critical' || req.urgency === 'immediate'
    );
    if (insights.featureRequests.length > 0) {
      insights.primaryInsightType = 'feature_requests';
      insights.priorityScore += insights.featureRequests.length * 2;
    }
  }
  
  // Check for technical issues or bugs
  if (analysis?.insights) {
    const technicalIssues = analysis.insights.filter(insight => 
      insight.category === 'technical_issue' ||
      insight.description.toLowerCase().includes('bug') ||
      insight.description.toLowerCase().includes('error') ||
      insight.description.toLowerCase().includes('broken') ||
      insight.description.toLowerCase().includes('not working')
    );
    
    if (technicalIssues.length > 0) {
      insights.shouldNotify = true;
      insights.technicalIssues = technicalIssues;
      insights.primaryInsightType = insights.primaryInsightType || 'technical_issues';
      insights.priorityScore += technicalIssues.length * 3;
    }
  }
  
  // Check for competitive intelligence
  if (analysis?.competitive_intelligence && analysis.competitive_intelligence.length > 0) {
    insights.shouldNotify = true;
    insights.competitiveIntel = analysis.competitive_intelligence;
    insights.primaryInsightType = insights.primaryInsightType || 'competitive_intel';
    insights.priorityScore += analysis.competitive_intelligence.length;
  }
  
  // Check for usability feedback
  if (analysis?.insights) {
    const usabilityFeedback = analysis.insights.filter(insight => 
      insight.category === 'usability' ||
      insight.description.toLowerCase().includes('confusing') ||
      insight.description.toLowerCase().includes('difficult') ||
      insight.description.toLowerCase().includes('user experience') ||
      insight.description.toLowerCase().includes('interface')
    );
    
    if (usabilityFeedback.length > 0) {
      insights.shouldNotify = true;
      insights.usabilityFeedback = usabilityFeedback;
      insights.primaryInsightType = insights.primaryInsightType || 'usability_feedback';
      insights.priorityScore += usabilityFeedback.length;
    }
  }
  
  // Don't notify for routine meetings without significant insights
  const routineMeetingTypes = ['demo', 'general', 'check_in', 'training'];
  if (routineMeetingTypes.includes(meetingType) && insights.priorityScore < 2) {
    insights.shouldNotify = false;
  }
  
  return insights;
}

function createProductNotification(customerName, meeting, productInsights, analysis) {
  const baseNotification = {
    action: 'send_notification',
    templateId: 'product-insight-alert', // Different template for product team
    type: 'product_insight',
    metadata: {
      meeting_id: meeting.id,
      customer: customerName,
      insight_type: productInsights.primaryInsightType,
      priority_score: productInsights.priorityScore,
      source: 'product_intelligence'
    }
  };
  
  switch (productInsights.primaryInsightType) {
    case 'feature_requests':
      return {
        ...baseNotification,
        templateData: {
          customerName: customerName,
          meetingTitle: meeting.title || 'Customer Meeting',
          insightType: `${productInsights.featureRequests.length} Feature Request(s)`,
          priorityScore: Math.min(10, productInsights.priorityScore),
          insightSummary: `${customerName} requested ${productInsights.featureRequests.length} features: ${productInsights.featureRequests.map(req => req.title).join(', ')}`,
          actionItems: productInsights.featureRequests.map(req => 
            `• ${req.title} (${req.priority} priority${req.timeframe ? ', needed ' + req.timeframe : ''})`
          ).join('\n'),
          customerQuote: `"${productInsights.featureRequests[0]?.description || 'See meeting for details'}"`,
          meetingUrl: meeting.recording_url || meeting.grain_share_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10001&summary=${encodeURIComponent(customerName + ' - ' + productInsights.featureRequests[0]?.title)}`
        }
      };
      
    case 'technical_issues':
      return {
        ...baseNotification,
        templateData: {
          customerName: customerName,
          meetingTitle: meeting.title || 'Support Meeting',
          insightType: `${productInsights.technicalIssues.length} Technical Issue(s)`,
          priorityScore: Math.min(10, productInsights.priorityScore),
          insightSummary: `${customerName} reported technical issues that may require product attention`,
          actionItems: productInsights.technicalIssues.map(issue => 
            `• ${issue.description} (Priority: ${issue.priority})`
          ).join('\n'),
          customerQuote: `"${productInsights.technicalIssues[0]?.description || 'Technical issues reported'}"`,
          meetingUrl: meeting.recording_url || meeting.grain_share_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10004&summary=${encodeURIComponent(customerName + ' - Technical Issue')}`
        }
      };
      
    case 'competitive_intel':
      return {
        ...baseNotification,
        templateData: {
          customerName: customerName,
          meetingTitle: meeting.title || 'Customer Meeting',
          insightType: `Competitive Intelligence`,
          priorityScore: Math.min(10, productInsights.priorityScore),
          insightSummary: `${customerName} mentioned competitors and their capabilities that we should be aware of`,
          actionItems: productInsights.competitiveIntel.map(intel => 
            `• Competitor: ${intel.competitor} - ${intel.capability}`
          ).join('\n'),
          customerQuote: `"${productInsights.competitiveIntel[0]?.context || 'Competitive insights discussed'}"`,
          meetingUrl: meeting.recording_url || meeting.grain_share_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10001&summary=${encodeURIComponent('Competitive Analysis - ' + customerName)}`
        }
      };
      
    case 'discovery':
      return {
        ...baseNotification,
        templateData: {
          customerName: customerName,
          meetingTitle: meeting.title || 'Discovery Meeting',
          insightType: `Discovery Session Insights`,
          priorityScore: Math.min(10, productInsights.priorityScore),
          insightSummary: `Discovery meeting with ${customerName} revealed product insights and market opportunities`,
          actionItems: [
            '• Review customer workflows and pain points',
            '• Assess product-market fit opportunities',
            '• Document user requirements for product planning',
            '• Identify potential feature gaps'
          ].join('\n'),
          customerQuote: extractMeetingQuote(meeting),
          meetingUrl: meeting.recording_url || meeting.grain_share_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10001&summary=${encodeURIComponent('Discovery Insights - ' + customerName)}`
        }
      };
      
    default:
      return {
        ...baseNotification,
        templateData: {
          customerName: customerName,
          meetingTitle: meeting.title || 'Customer Meeting',
          insightType: `Product Insights Available`,
          priorityScore: Math.min(10, productInsights.priorityScore),
          insightSummary: `Meeting with ${customerName} contains insights relevant to product development`,
          actionItems: '• Review meeting insights for product implications',
          customerQuote: extractMeetingQuote(meeting),
          meetingUrl: meeting.recording_url || meeting.grain_share_url || '#',
          jiraCreateUrl: `https://marq.atlassian.net/secure/CreateIssue.jspa?issuetype=10001&summary=${encodeURIComponent('Product Review - ' + customerName)}`
        }
      };
  }
}
