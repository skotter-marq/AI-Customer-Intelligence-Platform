#!/usr/bin/env node

/**
 * Test Enhanced AI Regeneration Error Handling
 */

require('dotenv').config({ path: '.env.local' });

async function testEnhancedRegeneration() {
  try {
    console.log('🧪 Testing enhanced AI regeneration error handling...\n');
    
    // Get a valid entry ID first
    const entriesResponse = await fetch('http://localhost:3000/api/changelog?status=pending&limit=1');
    const entriesData = await entriesResponse.json();
    
    if (!entriesData.success || entriesData.entries.length === 0) {
      console.log('❌ No pending entries found for testing');
      return;
    }
    
    const testEntryId = entriesData.entries[0].id;
    
    // Test with mix of valid and invalid stories (using actual JIRA keys from database)
    const testCases = [
      {
        name: 'Mix of valid and invalid stories',
        relatedStories: ['PRESS-21516', 'PRESS-21463', 'PRESS-21517'] // Middle one doesn't exist
      },
      {
        name: 'All valid stories',
        relatedStories: ['PRESS-21516', 'PRESS-21517']
      },
      {
        name: 'All invalid stories',
        relatedStories: ['INVALID-123', 'NONEXISTENT-456']
      },
      {
        name: 'Single invalid story',
        relatedStories: ['PRESS-21463']
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.name}`);
      console.log(`🎫 Entry ID: ${testEntryId}`);
      console.log(`🔗 Related Stories: ${testCase.relatedStories.join(', ')}`);
      console.log('---');
      
      // Test the regeneration API
      const response = await fetch('http://localhost:3000/api/regenerate-changelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: testEntryId,
          relatedStories: testCase.relatedStories
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Regeneration successful!');
        console.log(`📊 Stories processed: ${data.relatedStoriesProcessed}/${data.relatedStoriesRequested}`);
        if (data.failedStories && data.failedStories.length > 0) {
          console.log(`⚠️ Failed stories: ${data.failedStories.join(', ')}`);
        }
        console.log(`💬 Message: ${data.message}`);
        console.log(`📝 Enhanced title: ${data.enhancedContent.customer_facing_title}`);
      } else {
        console.log('❌ Regeneration failed:');
        console.log(`   Error: ${data.error}`);
        if (data.details) {
          console.log(`   Details: ${data.details}`);
        }
        if (data.failedStories) {
          console.log(`   Failed stories: ${data.failedStories.join(', ')}`);
        }
      }
      
      console.log(''); // Add spacing between test cases
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('\n💡 Make sure your dev server is running: npm run dev');
  }
}

console.log('Enhanced AI Regeneration Error Handling Test');
console.log('==========================================');
console.log('This will test error handling for invalid JIRA stories.\n');

testEnhancedRegeneration();