#!/usr/bin/env node

/**
 * Test TL;DR Update via Webhook Simulation
 * This creates a mock changelog entry and tests the approval flow
 */

require('dotenv').config({ path: '.env.local' });

async function testTldrViaApproval() {
  try {
    console.log('🧪 Testing TL;DR update via approval flow...\n');
    
    // Simulate approving a changelog entry
    const testEntryId = 'test-' + Date.now();
    const testJiraKey = process.argv[2] || 'PRESS-12345'; // Use command line arg
    const testTldr = 'Enhanced user authentication system with improved security features';
    
    console.log(`🎫 Test JIRA Key: ${testJiraKey}`);
    console.log(`📝 Test TL;DR: ${testTldr}`);
    console.log(`🔧 Field ID: ${process.env.JIRA_TLDR_FIELD_ID}\n`);
    
    // Make a request to our changelog API to test approval
    const response = await fetch(`http://localhost:3000/api/changelog?id=${testEntryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approval_status: 'approved',
        customer_facing_title: testTldr,
        public_visibility: true,
        // Simulate the source_data that would contain JIRA info
        source_data: {
          jira_story_key: testJiraKey,
          needs_approval: true
        }
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Approval API call successful');
      console.log('   Check the console logs for JIRA update attempts');
      console.log('   Check the JIRA issue to see if TL;DR field was updated');
    } else {
      console.log('❌ Approval API call failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('\n💡 Make sure your dev server is running: npm run dev');
  }
}

console.log('TL;DR Webhook Integration Test');
console.log('=============================');
console.log('Usage: node test-tldr-webhook.js [JIRA-KEY]');
console.log('Example: node test-tldr-webhook.js PRESS-21500');
console.log('');

testTldrViaApproval();