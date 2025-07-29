// analyze-with-real-ai.js
/**
 * Analyze existing meetings with REAL Claude AI
 */

const { createClient } = require('@supabase/supabase-js');
const AIProvider = require('./lib/ai-provider.js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const aiProvider = new AIProvider();

async function analyzeWithRealAI() {
  console.log('🤖 Starting REAL AI analysis of meetings...');
  
  try {
    // Get meetings with good transcript content
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .not('raw_transcript', 'is', null)
      .order('date', { ascending: false })
      .limit(3); // Start with 3 to test

    if (error) throw error;

    console.log(`📊 Found ${meetings.length} meetings with transcripts to analyze`);

    for (const meeting of meetings) {
      console.log(`\n🔍 Analyzing: ${meeting.title}`);
      console.log(`   Customer: ${extractCustomerName(meeting.title)}`);
      console.log(`   Transcript length: ${meeting.raw_transcript?.length || 0} characters`);
      
      if (!meeting.raw_transcript || meeting.raw_transcript.length < 50) {
        console.log('   ⚠️ Skipping - transcript too short');
        continue;
      }

      // Prepare meeting data for AI analysis
      const meetingData = {
        title: meeting.title,
        customer: extractCustomerName(meeting.title),
        duration: `${meeting.duration_minutes} minutes`,
        attendees: meeting.participants || [],
        transcript: meeting.raw_transcript,
        meetingType: inferMeetingType(meeting.title)
      };

      try {
        console.log('   🧠 Running Claude AI analysis...');
        
        // Analyze with REAL AI
        const analysis = await aiProvider.analyzeMeetingContent(meetingData);
        
        console.log('   ✅ AI Analysis Complete!');
        console.log(`      Sentiment: ${analysis.overall_analysis.sentiment_label} (${(analysis.overall_analysis.sentiment_score * 100).toFixed(0)}%)`);
        console.log(`      Confidence: ${(analysis.overall_analysis.confidence_score * 100).toFixed(0)}%`);
        console.log(`      Insights: ${analysis.insights.length}`);
        console.log(`      Action Items: ${analysis.action_items.length}`);
        console.log(`      Feature Requests: ${analysis.feature_requests.length}`);
        
        // Show key insights
        if (analysis.insights.length > 0) {
          console.log('   🔍 Key Insights:');
          analysis.insights.slice(0, 2).forEach((insight, i) => {
            console.log(`      ${i+1}. [${insight.type}] ${insight.title}`);
            console.log(`         "${insight.quote}"`);
          });
        }
        
        // Show action items
        if (analysis.action_items.length > 0) {
          console.log('   📋 Action Items:');
          analysis.action_items.slice(0, 2).forEach((item, i) => {
            console.log(`      ${i+1}. ${item.description} (${item.priority})`);
          });
        }

        // Show feature requests
        if (analysis.feature_requests.length > 0) {
          console.log('   💡 Feature Requests:');
          analysis.feature_requests.forEach((request, i) => {
            console.log(`      ${i+1}. ${request.title} (${request.urgency})`);
          });
        }

        console.log(`   📝 Summary: ${analysis.overall_analysis.summary}`);
        
      } catch (aiError) {
        console.error(`   ❌ AI analysis failed: ${aiError.message}`);
      }
    }

    console.log('\n🎉 Real AI analysis complete!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
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

// Run the analysis
analyzeWithRealAI().catch(console.error);