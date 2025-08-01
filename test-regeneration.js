#!/usr/bin/env node

/**
 * Test AI Regeneration with Related Stories
 */

require('dotenv').config({ path: '.env.local' });

async function testRegeneration() {
  try {
    console.log('🧪 Testing AI regeneration with related stories...\n');
    
    // Get a valid entry ID first
    const entriesResponse = await fetch('http://localhost:3001/api/changelog?status=pending&limit=1');
    const entriesData = await entriesResponse.json();
    
    if (!entriesData.success || entriesData.entries.length === 0) {
      console.log('❌ No pending entries found for testing');
      return;
    }
    
    const testEntryId = entriesData.entries[0].id;
    const testRelatedStories = ['PRESS-21500', 'PRESS-21501']; // Example related stories
    
    console.log(`🎫 Test Entry ID: ${testEntryId}`);
    console.log(`🔗 Related Stories: ${testRelatedStories.join(', ')}`);
    console.log('');
    
    // Test the regeneration API
    const response = await fetch('http://localhost:3001/api/regenerate-changelog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId: testEntryId,
        relatedStories: testRelatedStories
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Regeneration successful!');
      console.log(`📊 Related stories processed: ${data.relatedStoriesProcessed}`);
      console.log(`💬 Message: ${data.message}`);
      console.log('\n📝 Enhanced Content:');
      console.log(`   Title: ${data.enhancedContent.customer_facing_title}`);
      console.log(`   Category: ${data.enhancedContent.category}`);
      console.log(`   Description: ${data.enhancedContent.customer_facing_description.substring(0, 100)}...`);
      console.log(`   Highlights: ${data.enhancedContent.highlights.length} items`);
      data.enhancedContent.highlights.forEach((highlight, i) => {
        console.log(`     ${i + 1}. ${highlight}`);
      });
    } else {
      console.log('❌ Regeneration failed:');
      console.log(`   Error: ${data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('\n💡 Make sure your dev server is running: npm run dev');
  }
}

console.log('AI Regeneration Test');
console.log('===================');
console.log('This will test AI regeneration with related JIRA stories.\n');

testRegeneration();