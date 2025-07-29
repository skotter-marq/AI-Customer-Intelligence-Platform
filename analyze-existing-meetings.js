// analyze-existing-meetings.js
/**
 * Analyze existing meetings with AI and populate insights tables
 */

const { createClient } = require('@supabase/supabase-js');
const MockAIAnalysis = require('./lib/mock-ai-analysis.js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mockAI = new MockAIAnalysis();

async function analyzeExistingMeetings() {
  console.log('🤖 Starting AI analysis of existing meetings...');
  
  try {
    // Get all meetings that haven't been analyzed
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });

    if (meetingsError) {
      throw meetingsError;
    }

    console.log(`📊 Found ${meetings.length} meetings to analyze`);

    for (const meeting of meetings) {
      console.log(`\n🔍 Analyzing: ${meeting.title}`);
      
      // Prepare meeting data for AI analysis
      const meetingData = {
        title: meeting.title,
        customer: extractCustomerName(meeting.title),
        duration: `${meeting.duration_minutes} minutes`,
        attendees: meeting.participants || [],
        transcript: meeting.raw_transcript,
        meetingType: inferMeetingType(meeting.title)
      };

      // Analyze with mock AI
      const analysis = await mockAI.analyzeMeetingContent(meetingData);
      
      // Save insights to database
      await saveMeetingAnalysis(meeting.id, analysis);
      
      console.log(`✅ Analysis complete for: ${meeting.title}`);
      console.log(`   - Sentiment: ${analysis.overall_analysis.sentiment_label} (${(analysis.overall_analysis.sentiment_score * 100).toFixed(0)}%)`);
      console.log(`   - Insights: ${analysis.insights.length}`);
      console.log(`   - Action Items: ${analysis.action_items.length}`);
      console.log(`   - Feature Requests: ${analysis.feature_requests.length}`);
    }

    console.log('\n🎉 All meetings analyzed successfully!');
    
    // Show summary statistics
    await showAnalyticsSummary();

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

async function saveMeetingAnalysis(meetingId, analysis) {
  try {
    // Save meeting insights using existing schema
    if (analysis.insights && analysis.insights.length > 0) {
      const insights = analysis.insights.map(insight => ({
        source_type: 'meeting',
        source_id: meetingId,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        sentiment_score: insight.type === 'pain_point' ? -0.5 : 0.5,
        confidence_score: insight.confidence_score,
        priority: insight.priority,
        tags: insight.tags || []
      }));

      const { error: insightsError } = await supabase
        .from('insights')
        .insert(insights);

      if (insightsError) {
        console.error('Error saving insights:', insightsError);
      } else {
        console.log(`   💡 Saved ${insights.length} insights`);
      }
    }

    // Save feature requests using existing schema
    if (analysis.feature_requests && analysis.feature_requests.length > 0) {
      const featureRequests = analysis.feature_requests.map(request => ({
        title: request.title,
        description: request.description,
        category: 'ai_extracted',
        priority: request.urgency,
        business_value: request.estimated_impact,
        status: 'submitted'
      }));

      const { error: featuresError } = await supabase
        .from('feature_requests')
        .insert(featureRequests);

      if (featuresError) {
        console.error('Error saving feature requests:', featuresError);
      } else {
        console.log(`   💡 Saved ${featureRequests.length} feature requests`);
      }
    }

    // Create follow-up actions from action items
    if (analysis.action_items && analysis.action_items.length > 0) {
      const followUps = analysis.action_items.map(item => ({
        action_type: 'task',
        title: item.description,
        description: `Follow-up action from meeting analysis: ${item.description}`,
        priority: item.priority,
        due_date: getDueDateFromTimeframe(item.due_timeframe),
        assigned_to: item.assigned_to,
        status: 'pending'
      }));

      const { error: followUpError } = await supabase
        .from('follow_ups')
        .insert(followUps);

      if (followUpError) {
        console.error('Error saving follow-ups:', followUpError);
      } else {
        console.log(`   📋 Saved ${followUps.length} follow-up actions`);
      }
    }

  } catch (error) {
    console.error('Error saving meeting analysis:', error);
  }
}

function extractCustomerName(title) {
  const patterns = [
    /(?:demo|call|meeting)\s*[-–]\s*([^-–]+)/i,
    /([^-–]+?)\s*[-–]\s*(?:demo|call|meeting)/i,
    /with\s+([^-–(]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown Customer';
}

function inferMeetingType(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('demo')) return 'demo';
  if (titleLower.includes('check-in')) return 'check-in';
  if (titleLower.includes('feature')) return 'feature_request';
  if (titleLower.includes('support')) return 'support';
  
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

async function showAnalyticsSummary() {
  console.log('\n📊 Analysis Summary:');
  
  const { data: insights } = await supabase
    .from('insights')
    .select('priority');
    
  if (insights) {
    const highPriority = insights.filter(i => i.priority === 'high').length;
    const mediumPriority = insights.filter(i => i.priority === 'medium').length;
    const lowPriority = insights.filter(i => i.priority === 'low').length;
    
    console.log(`   💡 Total Insights: ${insights.length}`);
    console.log(`   🔥 High Priority: ${highPriority}`);
    console.log(`   ⚡ Medium Priority: ${mediumPriority}`);
    console.log(`   📝 Low Priority: ${lowPriority}`);
  }

  const { data: followUps } = await supabase
    .from('follow_ups')
    .select('priority');
    
  if (followUps) {
    console.log(`   📋 Follow-up Actions: ${followUps.length}`);
  }

  const { data: featureRequests } = await supabase
    .from('feature_requests')
    .select('priority');
    
  if (featureRequests) {
    const highPriority = featureRequests.filter(f => f.priority === 'high').length;
    console.log(`   💡 Feature Requests: ${featureRequests.length} (${highPriority} high priority)`);
  }
}

// Run the analysis
analyzeExistingMeetings().catch(console.error);