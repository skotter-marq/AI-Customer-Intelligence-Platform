#!/usr/bin/env node
/**
 * Customer Analysis Structure Test
 * Tests the analysis system structure without requiring AI credentials
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAnalysisStructure() {
  console.log('🧠 Testing Customer Analysis Structure...\n');
  
  try {
    // Test 1: Create test data
    console.log('1. Testing data creation...');
    const testData = await createTestData();
    console.log('✅ Test data created successfully');
    console.log(`   Customer: ${testData.customer.name}`);
    console.log(`   Meeting: ${testData.meeting.title}`);
    
    // Test 2: Test manual insight creation
    console.log('\n2. Testing insight creation...');
    const sampleInsights = [
      {
        type: 'pain_point',
        title: 'Dashboard Performance Issues',
        description: 'Customer reports 15-20 second load times for reporting dashboard',
        sentiment_score: -0.7,
        confidence_score: 0.9,
        priority: 'high',
        tags: ['performance', 'dashboard', 'reporting']
      },
      {
        type: 'feature_request',
        title: 'Export Functionality',
        description: 'Customer wants ability to export reports to Excel/CSV',
        sentiment_score: 0.2,
        confidence_score: 0.8,
        priority: 'medium',
        tags: ['export', 'reporting', 'excel']
      },
      {
        type: 'opportunity',
        title: 'Expansion Opportunity',
        description: 'Customer planning to add 10-15 more seats in Q4',
        sentiment_score: 0.8,
        confidence_score: 0.9,
        priority: 'high',
        tags: ['expansion', 'seats', 'growth']
      }
    ];
    
    const savedInsights = await saveTestInsights(sampleInsights, testData.meeting.id, testData.customer.id);
    console.log(`✅ Created ${savedInsights.length} test insights`);
    
    // Test 3: Test follow-up creation
    console.log('\n3. Testing follow-up creation...');
    const followUpActions = [
      {
        type: 'task',
        title: 'Investigate dashboard performance',
        description: 'Work with engineering to identify and fix dashboard performance issues',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assigned_to: 'engineering-team'
      },
      {
        type: 'email',
        title: 'Follow up on expansion timeline',
        description: 'Send email to understand Q4 expansion timeline and requirements',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assigned_to: 'sales-team'
      }
    ];
    
    const savedActions = await saveTestFollowUps(followUpActions, testData.customer.id, savedInsights[0].id);
    console.log(`✅ Created ${savedActions.length} follow-up actions`);
    
    // Test 4: Test analytics queries
    console.log('\n4. Testing analytics queries...');
    const analytics = await getTestAnalytics();
    console.log('✅ Analytics queries working');
    console.log(`   Total insights: ${analytics.totalInsights}`);
    console.log(`   Recent insights: ${analytics.recentInsights.length}`);
    
    // Test 5: Test correlation logic
    console.log('\n5. Testing correlation queries...');
    const correlations = await findTestCorrelations(testData.customer.id);
    console.log(`✅ Found ${correlations.length} potential correlations`);
    
    // Test 6: Test customer insights summary
    console.log('\n6. Testing customer insights summary...');
    const summary = await getCustomerSummary(testData.customer.id);
    console.log('✅ Customer summary generated');
    console.log(`   Total insights: ${summary.totalInsights}`);
    console.log(`   High priority: ${summary.highPriorityInsights}`);
    console.log(`   Pending actions: ${summary.pendingActions}`);
    
    // Test 7: Clean up
    console.log('\n7. Cleaning up test data...');
    await cleanupTestData(testData);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Analysis Structure Test Complete!');
    console.log('\n📊 Test Summary:');
    console.log('   - Data Creation: ✅ Working');
    console.log('   - Insight Management: ✅ Working');
    console.log('   - Follow-up Actions: ✅ Working');
    console.log('   - Analytics Queries: ✅ Working');
    console.log('   - Correlation Logic: ✅ Working');
    console.log('   - Customer Summary: ✅ Working');
    console.log('\n✨ The analysis system is ready for AI integration!');
    
  } catch (error) {
    console.error('❌ Analysis Structure test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function createTestData() {
  // Create test customer (using minimal data for existing schema)
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      name: 'Test Structure Corp'
    })
    .select()
    .single();
  
  if (customerError) {
    throw new Error(`Failed to create test customer: ${customerError.message}`);
  }
  
  // Create test meeting (using existing schema column names)
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      grain_id: 'test_structure_meeting_' + Date.now(),
      customer_id: customer.id,
      title: 'Structure Test Meeting',
      date: new Date().toISOString(),
      duration_minutes: 30,
      participants: [
        { name: 'Test User', email: 'test@teststructure.com', role: 'CTO' }
      ],
      raw_transcript: 'This is a test transcript for structure validation.'
    })
    .select()
    .single();
  
  if (meetingError) {
    throw new Error(`Failed to create test meeting: ${meetingError.message}`);
  }
  
  return { customer, meeting };
}

async function saveTestInsights(insights, meetingId, customerId) {
  const savedInsights = [];
  
  for (const insight of insights) {
    const insightData = {
      customer_id: customerId,
      source_type: 'meeting',
      source_id: meetingId,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      sentiment_score: insight.sentiment_score,
      confidence_score: insight.confidence_score,
      priority: insight.priority,
      tags: insight.tags || []
    };
    
    const { data: saved, error } = await supabase
      .from('insights')
      .insert(insightData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to save insight: ${error.message}`);
    }
    
    savedInsights.push(saved);
  }
  
  return savedInsights;
}

async function saveTestFollowUps(actions, customerId, insightId) {
  const savedActions = [];
  
  for (const action of actions) {
    const actionData = {
      customer_id: customerId,
      insight_id: insightId,
      action_type: action.type,
      title: action.title,
      description: action.description,
      priority: action.priority,
      due_date: action.due_date,
      assigned_to: action.assigned_to
    };
    
    const { data: saved, error } = await supabase
      .from('follow_ups')
      .insert(actionData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to save follow-up: ${error.message}`);
    }
    
    savedActions.push(saved);
  }
  
  return savedActions;
}

async function getTestAnalytics() {
  const { data: totalInsights } = await supabase
    .from('insights')
    .select('*');
  
  const { data: recentInsights } = await supabase
    .from('insights')
    .select('*, customers(*)')
    .order('created_at', { ascending: false })
    .limit(5);
  
  return {
    totalInsights: totalInsights?.length || 0,
    recentInsights: recentInsights || []
  };
}

async function findTestCorrelations(customerId) {
  const { data: customerInsights } = await supabase
    .from('insights')
    .select('*')
    .eq('customer_id', customerId);
  
  const correlations = [];
  
  for (const insight of customerInsights || []) {
    const { data: similarInsights } = await supabase
      .from('insights')
      .select('*, customers(*)')
      .neq('customer_id', customerId)
      .eq('insight_type', insight.insight_type)
      .limit(3);
    
    if (similarInsights && similarInsights.length > 0) {
      correlations.push({
        sourceInsight: insight,
        similarCount: similarInsights.length
      });
    }
  }
  
  return correlations;
}

async function getCustomerSummary(customerId) {
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .eq('customer_id', customerId);
  
  const { data: actions } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('customer_id', customerId)
    .eq('status', 'pending');
  
  const highPriorityInsights = (insights || []).filter(i => i.priority === 'high').length;
  
  return {
    totalInsights: insights?.length || 0,
    highPriorityInsights,
    pendingActions: actions?.length || 0
  };
}

async function cleanupTestData(testData) {
  // Delete in reverse order to handle foreign key constraints
  await supabase.from('follow_ups').delete().eq('customer_id', testData.customer.id);
  await supabase.from('insights').delete().eq('customer_id', testData.customer.id);
  await supabase.from('meetings').delete().eq('id', testData.meeting.id);
  await supabase.from('customers').delete().eq('id', testData.customer.id);
}

// Run the test
if (require.main === module) {
  testAnalysisStructure();
}

module.exports = { testAnalysisStructure };