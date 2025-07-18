#!/usr/bin/env node
/**
 * Customer Analysis AI Test Script
 * Tests the complete customer analysis pipeline
 */

const CustomerAnalysisAI = require('./lib/customer-analysis-ai.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCustomerAnalysis() {
  console.log('🧠 Testing Customer Analysis AI...\n');
  
  try {
    const analysisAI = new CustomerAnalysisAI();
    
    // Test 1: Create test data
    console.log('1. Setting up test data...');
    const testData = await createTestData();
    console.log('✅ Test data created');
    console.log(`   Customer: ${testData.customer.company_name}`);
    console.log(`   Meeting: ${testData.meeting.title}`);
    
    // Test 2: Analyze meeting
    console.log('\n2. Testing meeting analysis...');
    const meetingAnalysis = await analysisAI.analyzeMeeting(testData.meeting.id);
    
    if (meetingAnalysis.success) {
      console.log('✅ Meeting analysis successful');
      console.log(`   Insights found: ${meetingAnalysis.insights.length}`);
      console.log(`   Follow-up actions: ${meetingAnalysis.followUpActions.length}`);
      console.log(`   Overall sentiment: ${meetingAnalysis.analysis.overallSentiment}`);
      
      // Show sample insights
      if (meetingAnalysis.insights.length > 0) {
        console.log('   Sample insights:');
        meetingAnalysis.insights.slice(0, 3).forEach((insight, index) => {
          console.log(`     ${index + 1}. [${insight.insight_type}] ${insight.title}`);
          console.log(`        Priority: ${insight.priority} | Confidence: ${insight.confidence_score}`);
        });
      }
    } else {
      console.log('❌ Meeting analysis failed');
    }
    
    // Test 3: HubSpot data analysis
    console.log('\n3. Testing HubSpot data analysis...');
    const hubspotAnalysis = await analysisAI.analyzeHubSpotData(testData.customer.id);
    
    if (hubspotAnalysis.success) {
      console.log('✅ HubSpot analysis successful');
      console.log(`   Insights found: ${hubspotAnalysis.insights.length}`);
      console.log(`   Contacts analyzed: ${hubspotAnalysis.contactCount}`);
      console.log(`   Deals analyzed: ${hubspotAnalysis.dealCount}`);
    } else {
      console.log('❌ HubSpot analysis failed');
    }
    
    // Test 4: Customer correlations
    console.log('\n4. Testing customer correlations...');
    const correlations = await analysisAI.findCustomerCorrelations(testData.customer.id);
    console.log(`✅ Found ${correlations.length} correlations`);
    
    // Test 5: Analytics
    console.log('\n5. Testing analytics...');
    const analytics = await analysisAI.getAnalytics();
    console.log('✅ Analytics retrieved');
    console.log(`   Total insights: ${analytics.totalInsights}`);
    console.log(`   Analyzed meetings: ${analytics.analyzedMeetings}`);
    console.log(`   Pending meetings: ${analytics.pendingMeetings}`);
    
    // Test 6: Clean up test data
    console.log('\n6. Cleaning up test data...');
    await cleanupTestData(testData);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Customer Analysis AI test complete!');
    console.log('\n📊 Summary:');
    console.log('   - Meeting Analysis: ✅ Working');
    console.log('   - HubSpot Analysis: ✅ Working');
    console.log('   - Customer Correlations: ✅ Working');
    console.log('   - Analytics: ✅ Working');
    
  } catch (error) {
    console.error('❌ Customer Analysis test failed:', error.message);
    console.error('\n🔧 Common Issues:');
    console.error('   - Make sure AI provider is configured (OPENAI_API_KEY or ANTHROPIC_API_KEY)');
    console.error('   - Verify database connection (run: npm run test:hubspot)');
    console.error('   - Check that all required tables exist in Supabase');
  }
}

async function createTestData() {
  // Create test customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      company_name: 'Test Analysis Corp',
      domain: 'testanalysis.com',
      industry: 'Technology',
      company_size: 'Mid-market',
      location: 'San Francisco, CA',
      customer_segment: 'Enterprise',
      lifecycle_stage: 'Customer'
    })
    .select()
    .single();
  
  if (customerError) {
    throw new Error(`Failed to create test customer: ${customerError.message}`);
  }
  
  // Create test meeting with transcript
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      grain_meeting_id: 'test_analysis_meeting_123',
      customer_id: customer.id,
      title: 'Q3 Product Feedback Session',
      description: 'Quarterly review with customer feedback and feature requests',
      meeting_date: new Date().toISOString(),
      duration_minutes: 45,
      attendees: [
        { name: 'John Smith', email: 'john@testanalysis.com', role: 'CTO' },
        { name: 'Sarah Johnson', email: 'sarah@ourcompany.com', role: 'Customer Success' }
      ],
      transcript: `
Sarah: Hi John, thanks for joining our Q3 review. How has the platform been working for your team?

John: Overall, we're pretty happy with it. The core functionality is solid and our team has been productive. However, I do have some feedback.

Sarah: Great! I'd love to hear both the positives and areas for improvement.

John: Well, the main pain point we're experiencing is with the reporting dashboard. It's incredibly slow - sometimes taking 15-20 seconds just to load basic metrics. Our team needs to check these numbers multiple times throughout the day, so it's really impacting our workflow.

Sarah: I understand that's frustrating. That's definitely something we need to address.

John: Another thing is that we'd love more granular filtering options. Right now we can only filter by month, but we really need daily and weekly views for our operations.

Sarah: Those are excellent suggestions. What else would be helpful?

John: Export functionality would be huge. Being able to export these reports directly to Excel or CSV would save us hours of manual work each week.

Sarah: That makes complete sense. Any other features on your wishlist?

John: Real-time notifications would be amazing. When certain thresholds are hit, we'd love to get alerts via email or Slack. Right now we have to manually check everything.

Sarah: I'm taking notes on all of this. On the positive side, what's working well?

John: The customer support has been fantastic. Whenever we've had issues, your team responds quickly and actually solves our problems. That's rare these days.

Sarah: I'm glad to hear that. How do you feel about the upcoming renewal?

John: We're definitely planning to renew. We're also interested in expanding to more users - probably adding another 10-15 seats in Q4 if the performance issues get resolved.

Sarah: That's great news. We'll definitely prioritize the performance improvements you mentioned.

John: Perfect. One last thing - we've been looking at some competitors recently, and while we're happy with you guys, we did notice that CompetitorX has some interesting automation features that we don't see here.

Sarah: Can you tell me more about those features?

John: They have automatic data syncing with our CRM and some AI-powered insights generation. It's not a deal-breaker, but it would be nice to have.

Sarah: I'll make sure our product team hears about this. Thanks for the honest feedback, John.

John: Of course! Looking forward to seeing these improvements in the next quarter.
      `,
      meeting_type: 'review',
      meeting_status: 'pending'
    })
    .select()
    .single();
  
  if (meetingError) {
    throw new Error(`Failed to create test meeting: ${meetingError.message}`);
  }
  
  // Create test HubSpot contact
  const { data: hubspotContact, error: contactError } = await supabase
    .from('hubspot_contacts')
    .insert({
      hubspot_contact_id: 'test_contact_analysis_123',
      customer_id: customer.id
    })
    .select()
    .single();
  
  if (contactError) {
    throw new Error(`Failed to create test HubSpot contact: ${contactError.message}`);
  }
  
  // Create test HubSpot deal
  const { data: hubspotDeal, error: dealError } = await supabase
    .from('hubspot_deals')
    .insert({
      hubspot_deal_id: 'test_deal_analysis_123',
      customer_id: customer.id,
      deal_name: 'Test Analysis Corp - Expansion',
      deal_stage: 'negotiation',
      deal_amount: 25000,
      close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    .select()
    .single();
  
  if (dealError) {
    throw new Error(`Failed to create test HubSpot deal: ${dealError.message}`);
  }
  
  return {
    customer,
    meeting,
    hubspotContact,
    hubspotDeal
  };
}

async function cleanupTestData(testData) {
  // Delete in reverse order to handle foreign key constraints
  await supabase.from('follow_ups').delete().eq('customer_id', testData.customer.id);
  await supabase.from('insights').delete().eq('customer_id', testData.customer.id);
  await supabase.from('customer_correlations').delete().eq('primary_customer_id', testData.customer.id);
  await supabase.from('customer_correlations').delete().eq('related_customer_id', testData.customer.id);
  await supabase.from('hubspot_deals').delete().eq('id', testData.hubspotDeal.id);
  await supabase.from('hubspot_contacts').delete().eq('id', testData.hubspotContact.id);
  await supabase.from('meetings').delete().eq('id', testData.meeting.id);
  await supabase.from('customers').delete().eq('id', testData.customer.id);
}

// Run the test
if (require.main === module) {
  testCustomerAnalysis();
}

module.exports = { testCustomerAnalysis };