#!/usr/bin/env node
/**
 * Basic Structure Test
 * Tests basic database operations with existing schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBasicStructure() {
  console.log('🧠 Testing Basic Database Structure...\n');
  
  try {
    // Test 1: Create test customer
    console.log('1. Testing customer creation...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: 'Test Basic Corp'
      })
      .select()
      .single();
    
    if (customerError) {
      throw new Error(`Failed to create customer: ${customerError.message}`);
    }
    
    console.log('✅ Customer created successfully');
    console.log(`   Customer ID: ${customer.id}`);
    console.log(`   Customer Name: ${customer.name}`);
    
    // Test 2: Create test meeting
    console.log('\n2. Testing meeting creation...');
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        grain_id: 'test_basic_meeting_' + Date.now(),
        customer_id: customer.id,
        title: 'Basic Test Meeting',
        date: new Date().toISOString(),
        duration_minutes: 30,
        participants: [
          { name: 'Test User', email: 'test@basic.com', role: 'CEO' }
        ],
        raw_transcript: 'This is a basic test transcript for validation.'
      })
      .select()
      .single();
    
    if (meetingError) {
      throw new Error(`Failed to create meeting: ${meetingError.message}`);
    }
    
    console.log('✅ Meeting created successfully');
    console.log(`   Meeting ID: ${meeting.id}`);
    console.log(`   Meeting Title: ${meeting.title}`);
    
    // Test 3: Create HubSpot contact
    console.log('\n3. Testing HubSpot contact creation...');
    const { data: contact, error: contactError } = await supabase
      .from('hubspot_contacts')
      .insert({
        hubspot_contact_id: 'test_basic_contact_' + Date.now(),
        customer_id: customer.id
      })
      .select()
      .single();
    
    if (contactError) {
      throw new Error(`Failed to create HubSpot contact: ${contactError.message}`);
    }
    
    console.log('✅ HubSpot contact created successfully');
    console.log(`   Contact ID: ${contact.id}`);
    
    // Test 4: Create HubSpot deal
    console.log('\n4. Testing HubSpot deal creation...');
    const { data: deal, error: dealError } = await supabase
      .from('hubspot_deals')
      .insert({
        hubspot_deal_id: 'test_basic_deal_' + Date.now(),
        customer_id: customer.id,
        deal_name: 'Basic Test Deal',
        deal_stage: 'qualification',
        deal_amount: 10000
      })
      .select()
      .single();
    
    if (dealError) {
      throw new Error(`Failed to create HubSpot deal: ${dealError.message}`);
    }
    
    console.log('✅ HubSpot deal created successfully');
    console.log(`   Deal ID: ${deal.id}`);
    console.log(`   Deal Name: ${deal.deal_name}`);
    
    // Test 5: Create basic insight
    console.log('\n5. Testing insight creation...');
    const { data: insight, error: insightError } = await supabase
      .from('insights')
      .insert({
        customer_id: customer.id,
        source_type: 'meeting',
        source_id: meeting.id,
        insight_type: 'pain_point',
        title: 'Basic Test Insight'
      })
      .select()
      .single();
    
    if (insightError) {
      throw new Error(`Failed to create insight: ${insightError.message}`);
    }
    
    console.log('✅ Insight created successfully');
    console.log(`   Insight ID: ${insight.id}`);
    console.log(`   Insight Title: ${insight.title}`);
    
    // Test 6: Create follow-up
    console.log('\n6. Testing follow-up creation...');
    const { data: followUp, error: followUpError } = await supabase
      .from('follow_ups')
      .insert({
        customer_id: customer.id,
        insight_id: insight.id,
        action_type: 'task',
        title: 'Basic Test Follow-up',
        priority: 'medium',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (followUpError) {
      throw new Error(`Failed to create follow-up: ${followUpError.message}`);
    }
    
    console.log('✅ Follow-up created successfully');
    console.log(`   Follow-up ID: ${followUp.id}`);
    console.log(`   Follow-up Title: ${followUp.title}`);
    
    // Test 7: Query relationships
    console.log('\n7. Testing relationship queries...');
    const { data: customerWithData, error: queryError } = await supabase
      .from('customers')
      .select(`
        *,
        meetings(*),
        insights(*),
        follow_ups(*)
      `)
      .eq('id', customer.id)
      .single();
    
    if (queryError) {
      throw new Error(`Failed to query relationships: ${queryError.message}`);
    }
    
    console.log('✅ Relationship queries working');
    console.log(`   Customer has ${customerWithData.meetings.length} meetings`);
    console.log(`   Customer has ${customerWithData.insights.length} insights`);
    console.log(`   Customer has ${customerWithData.follow_ups.length} follow-ups`);
    
    // Test 8: Clean up
    console.log('\n8. Cleaning up test data...');
    await supabase.from('follow_ups').delete().eq('customer_id', customer.id);
    await supabase.from('insights').delete().eq('customer_id', customer.id);
    await supabase.from('hubspot_deals').delete().eq('customer_id', customer.id);
    await supabase.from('hubspot_contacts').delete().eq('customer_id', customer.id);
    await supabase.from('meetings').delete().eq('customer_id', customer.id);
    await supabase.from('customers').delete().eq('id', customer.id);
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Basic Structure Test Complete!');
    console.log('\n📊 Test Summary:');
    console.log('   - Customer Creation: ✅ Working');
    console.log('   - Meeting Creation: ✅ Working');
    console.log('   - HubSpot Integration: ✅ Working');
    console.log('   - Insight Management: ✅ Working');
    console.log('   - Follow-up Actions: ✅ Working');
    console.log('   - Relationship Queries: ✅ Working');
    console.log('\n✨ Database structure is ready for AI integration!');
    
  } catch (error) {
    console.error('❌ Basic Structure test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testBasicStructure();
}

module.exports = { testBasicStructure };