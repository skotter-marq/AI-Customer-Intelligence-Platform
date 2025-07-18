#!/usr/bin/env node
/**
 * Test Table Structure
 * Tests inserting minimal data to understand table structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTableStructure() {
  console.log('🔍 Testing table structure...\n');
  
  try {
    // Test hubspot_contacts with minimal data
    console.log('Testing hubspot_contacts...');
    const { data: contactData, error: contactError } = await supabase
      .from('hubspot_contacts')
      .insert({
        hubspot_contact_id: 'test_contact_123'
      })
      .select();
    
    if (contactError) {
      console.log('Contact error:', contactError.message);
    } else {
      console.log('✅ hubspot_contacts insert successful');
      
      // Clean up
      await supabase
        .from('hubspot_contacts')
        .delete()
        .eq('hubspot_contact_id', 'test_contact_123');
    }
    
    // Test hubspot_deals with minimal data
    console.log('\nTesting hubspot_deals...');
    const { data: dealData, error: dealError } = await supabase
      .from('hubspot_deals')
      .insert({
        hubspot_deal_id: 'test_deal_123'
      })
      .select();
    
    if (dealError) {
      console.log('Deal error:', dealError.message);
    } else {
      console.log('✅ hubspot_deals insert successful');
      
      // Clean up
      await supabase
        .from('hubspot_deals')
        .delete()
        .eq('hubspot_deal_id', 'test_deal_123');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

if (require.main === module) {
  testTableStructure();
}

module.exports = { testTableStructure };