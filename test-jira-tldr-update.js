#!/usr/bin/env node

/**
 * Test JIRA TL;DR Field Update
 * Use this script to test updating the TL;DR field once you know the field ID
 */

const JiraIntegration = require('./lib/jira-integration.js');
require('dotenv').config({ path: '.env.local' });

async function testTldrUpdate() {
  try {
    console.log('🧪 Testing JIRA TL;DR field update...\n');
    
    // You can modify these test values
    const TEST_ISSUE_KEY = process.argv[2] || 'PRESS-21536'; // Use command line arg or default
    const TEST_TLDR = process.argv[3] || 'Test TL;DR from approval system - ' + new Date().toLocaleTimeString();
    
    console.log(`🎫 Issue Key: ${TEST_ISSUE_KEY}`);
    console.log(`📝 Test TL;DR: ${TEST_TLDR}`);
    console.log(`🔧 Field ID: ${process.env.JIRA_TLDR_FIELD_ID || 'customfield_10037 (default)'}\n`);
    
    const jira = new JiraIntegration();
    
    // Test the TL;DR update
    console.log('🔄 Attempting to update TL;DR field...');
    const result = await jira.updateTLDR(TEST_ISSUE_KEY, TEST_TLDR);
    
    if (result.success) {
      console.log('✅ TL;DR update successful!');
      console.log(`   Updated fields: ${result.updatedFields?.join(', ')}`);
      console.log(`\n🎯 Check the JIRA issue to confirm the TL;DR field was updated.`);
    } else {
      console.log('❌ TL;DR update failed:');
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      
      console.log('\n💡 Common issues:');
      console.log('   1. Wrong field ID - check your JIRA_TLDR_FIELD_ID');
      console.log('   2. Permission issues - ensure API token has edit permissions');
      console.log('   3. Field type mismatch - TL;DR field might be a different type');
      console.log('   4. Issue doesn\'t exist or is in wrong project');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

console.log('JIRA TL;DR Field Test');
console.log('===================');
console.log('Usage: node test-jira-tldr-update.js [ISSUE-KEY] [TEST-TLDR]');
console.log('Example: node test-jira-tldr-update.js PRESS-21536 "My test TL;DR"');
console.log('');

testTldrUpdate();