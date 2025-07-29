// test-zapier-grain-webhook.js
/**
 * Test script to simulate Zapier Grain app "Recorded Added" trigger webhook data
 * This tests the new Zapier integration format
 */

const fetch = require('node-fetch');

const WEBHOOK_URL = 'http://localhost:3000/api/grain-webhook';

// Sample Zapier Grain app webhook payloads (simulated based on common Zapier patterns)
const zapierGrainSamples = [
  {
    // Format 1: Flattened structure with grain_ prefixes
    id: 'zapier_grain_001',
    recording_id: 'grain_zapier_demo_001', 
    grain_meeting_title: 'Zapier Demo - CloudSync Technologies',
    title: 'Zapier Demo - CloudSync Technologies',
    recorded_at: '2024-01-29T15:30:00Z',
    created_at: '2024-01-29T15:30:00Z',
    duration_minutes: 35,
    duration_seconds: 2100,
    organizer_name: 'Alex Rivera',
    organizer_email: 'alex@company.com',
    attendee_1_name: 'David Park',
    attendee_1_email: 'david@cloudsync.com',
    attendee_2_name: 'Jennifer Liu',
    attendee_2_email: 'jennifer@cloudsync.com',
    transcript: `Alex Rivera: Thanks for joining today's demo, David and Jennifer. I'm excited to show you how our platform can streamline your workflow.

David Park: We're currently using Monday.com but finding it lacks the analytics depth we need.

Alex Rivera: That's a common challenge. Let me show you our advanced reporting features first.

Jennifer Liu: This dashboard looks much more intuitive than what we're using. How customizable are these widgets?

Alex Rivera: Completely customizable. You can drag, drop, resize, and create custom formulas for any metric.

David Park: What about integrations? We heavily use Slack and need everything to sync there.

Alex Rivera: We have native Slack integration plus webhooks for real-time notifications. Let me demonstrate.

Jennifer Liu: This could save us hours of manual reporting each week. What's the pricing structure?

Alex Rivera: I'll prepare a custom quote based on your team size. For 50 users, you'd be looking at our Professional tier.

David Park: We'd need this implemented before Q2. What's the typical onboarding timeline?

Alex Rivera: 2-3 weeks for full deployment including data migration and team training.

Jennifer Liu: Perfect. Can we start with a pilot program for our marketing team?

Alex Rivera: Absolutely. I'll set up a 30-day pilot with your core features enabled.`,
    recording_url: 'https://grain.com/recordings/zapier_demo_001',
    grain_share_url: 'https://grain.com/share/zapier_demo_001',
    workspace_name: 'Sales Team Zapier'
  },
  {
    // Format 2: JSON strings for complex data
    id: 'zapier_grain_002',
    grain_recording_id: 'grain_zapier_support_002',
    meeting_title: 'Support Call - RetailMax API Issues',
    recorded_at: '2024-01-29T11:15:00Z',
    duration: 1680, // 28 minutes in seconds
    participants: '[{"name":"Maria Santos","email":"maria@company.com","role":"host"},{"name":"Tom Bradley","email":"tom@retailmax.com","role":"attendee"}]',
    transcript_text: `Maria Santos: Hi Tom, I see you're experiencing some integration issues with our API.

Tom Bradley: Yes, we're getting inconsistent responses from the inventory endpoint. Sometimes it returns 200, sometimes 500.

Maria Santos: Let me check your API logs right now. What's your environment - staging or production?

Tom Bradley: This is happening in production, which is concerning our customers.

Maria Santos: I understand the urgency. I can see some rate limiting issues in your account. Let me adjust those immediately.

Tom Bradley: We also need better error handling. The current messages don't help us debug issues.

Maria Santos: That's excellent feedback. We're releasing improved error codes next month, but I can enable the beta version for your account.

Tom Bradley: That would be great. We also want to discuss SLA guarantees.

Maria Santos: I'll connect you with our enterprise team to discuss SLA options and potentially upgrade your support tier.

Tom Bradley: How quickly can we resolve the current issue?

Maria Santos: I'm applying the rate limit fix now. You should see improvements within 10 minutes.`,
    host_name: 'Maria Santos',
    host_email: 'maria@company.com',
    grain_workspace: 'Customer Success'
  },
  {
    // Format 3: Minimal Zapier format
    recording_id: 'grain_min_003',
    title: 'Feature Discussion - StartupABC Dashboard',
    created_at_iso: '2024-01-29T17:45:00Z',
    attendees: 'Kelly Chen, mike@startupABC.com, Jennifer Walsh, jennifer@company.com',
    transcript: `Kelly Chen: We need more flexibility in our dashboard layouts for different user roles.

Jennifer Walsh: Can you describe the specific customization you're looking for?

Kelly Chen: Our executives want high-level metrics, but our analysts need detailed breakdowns.

Jennifer Walsh: That sounds like a perfect use case for our role-based dashboard feature.

Kelly Chen: Exactly! Plus we need the ability to share specific views with our board.

Jennifer Walsh: I can prioritize these features for our Q2 roadmap. When do you need this functionality?

Kelly Chen: Ideally by end of Q2 for our board presentation in June.

Jennifer Walsh: I'll get this into our next sprint planning and send you a timeline by Friday.`
  }
];

async function testZapierGrainWebhook() {
  console.log('🧪 Testing Zapier Grain webhook integration...\n');

  for (const [index, zapierData] of zapierGrainSamples.entries()) {
    console.log(`📱 Testing Zapier Sample ${index + 1}:`);
    console.log(`   Format: ${zapierData.participants ? 'JSON participants' : zapierData.attendee_1_name ? 'Individual attendees' : 'Minimal format'}`);
    console.log(`   Title: ${zapierData.title || zapierData.grain_meeting_title || zapierData.meeting_title}`);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zapierData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ Zapier webhook processed successfully`);
        console.log(`      Meeting ID: ${result.meeting_id}`);
        console.log(`      Source: ${result.source}`);
        console.log(`      AI Analysis: ${result.ai_analysis ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ❌ Zapier webhook failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing Zapier sample ${index + 1}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('🎉 Zapier Grain webhook testing completed!');
  console.log('\n📊 Check your database and dashboard to see the imported meetings.');
  console.log('🔍 Compare these with direct Grain webhook results to verify both formats work.');
}

// Test webhook endpoint status first
async function testWebhookStatus() {
  try {
    console.log('🔍 Testing webhook endpoint status...');
    const response = await fetch(WEBHOOK_URL, { method: 'GET' });
    const status = await response.json();
    
    console.log('✅ Webhook endpoint is active');
    console.log('📋 Supported sources:', status.supported_sources);
    console.log('🚀 Features:', status.features.slice(0, 3).join(', ') + '...\n');
    
    return true;
  } catch (error) {
    console.error('❌ Webhook endpoint not available:', error.message);
    console.log('💡 Make sure your Next.js server is running: npm run dev\n');
    return false;
  }
}

// Run the tests
async function runTests() {
  const isEndpointActive = await testWebhookStatus();
  
  if (isEndpointActive) {
    await testZapierGrainWebhook();
  } else {
    console.log('⏭️  Skipping webhook tests due to endpoint unavailability');
  }
}

runTests().catch(console.error);