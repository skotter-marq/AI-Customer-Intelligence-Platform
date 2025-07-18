#!/usr/bin/env node
/**
 * HubSpot Integration Test Script
 * Tests the HubSpot integration and database connectivity
 */

const HubSpotIntegration = require('./lib:hubspot.js');
require('dotenv').config({ path: '.env.local' });

async function testHubSpotIntegration() {
  console.log('🔍 Testing HubSpot Integration...\n');
  
  try {
    const hubspot = new HubSpotIntegration();
    
    // Test 1: Connection test
    console.log('1. Testing HubSpot connection...');
    const connectionResult = await hubspot.testConnection();
    
    if (connectionResult.success) {
      console.log('✅ HubSpot connection successful');
      console.log(`   Contact count: ${connectionResult.contactCount}`);
    } else {
      console.log('❌ HubSpot connection failed:', connectionResult.error);
      return;
    }
    
    // Test 2: Sync contacts
    console.log('\n2. Testing contact sync...');
    const contactSync = await hubspot.syncContacts(5);
    
    if (contactSync.success) {
      console.log('✅ Contact sync successful');
      console.log(`   Synced ${contactSync.count} contacts`);
    } else {
      console.log('❌ Contact sync failed:', contactSync.error);
    }
    
    // Test 3: Sync deals
    console.log('\n3. Testing deal sync...');
    const dealSync = await hubspot.syncDeals(5);
    
    if (dealSync.success) {
      console.log('✅ Deal sync successful');
      console.log(`   Synced ${dealSync.count} deals`);
    } else {
      console.log('❌ Deal sync failed:', dealSync.error);
    }
    
    console.log('\n🎉 HubSpot integration test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Make sure you have:');
    console.error('   - HUBSPOT_ACCESS_TOKEN in .env.local');
    console.error('   - SUPABASE credentials in .env.local');
    console.error('   - Database tables created (run: node scripts/setup-database.js)');
  }
}

// Run the test
if (require.main === module) {
  testHubSpotIntegration();
}

module.exports = { testHubSpotIntegration };