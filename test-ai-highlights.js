#!/usr/bin/env node

/**
 * Test AI Provider to debug highlights generation
 */

require('dotenv').config({ path: '.env.local' });
const AIProvider = require('./lib/ai-provider.js');

async function testAIHighlights() {
  try {
    console.log('🧪 Testing AI provider for highlights generation...\n');
    
    const sampleJiraIssue = {
      key: 'PRESS-TEST',
      fields: {
        summary: 'Enhanced user authentication with multi-factor support',
        description: 'Implemented comprehensive multi-factor authentication system including SMS, email, and authenticator app support. This includes enhanced session management, automatic timeout handling, and improved security logging for audit trails.',
        status: { name: 'Done' },
        priority: { name: 'High' },
        components: [
          { name: 'Frontend' },
          { name: 'Security' }
        ],
        labels: ['customer-impact', 'security', 'authentication'],
        reporter: { displayName: 'John Developer' },
        assignee: { displayName: 'Jane Developer' }
      }
    };
    
    console.log('📋 Sample JIRA Issue:');
    console.log(`   Key: ${sampleJiraIssue.key}`);
    console.log(`   Summary: ${sampleJiraIssue.fields.summary}`);
    console.log(`   Priority: ${sampleJiraIssue.fields.priority.name}\n`);
    
    const aiProvider = new AIProvider();
    
    console.log('🤖 Generating changelog entry with AI...');
    const result = await aiProvider.generateChangelogEntry(sampleJiraIssue);
    
    console.log('\n✅ AI Response:');
    console.log('📝 Customer Title:', result.customer_title);
    console.log('📄 Customer Description:', result.customer_description);
    console.log('🔹 Highlights:');
    
    if (Array.isArray(result.highlights)) {
      result.highlights.forEach((highlight, index) => {
        console.log(`   ${index + 1}. ${highlight}`);
      });
    } else {
      console.log('   ⚠️ Highlights is not an array:', typeof result.highlights);
      console.log('   Value:', result.highlights);
    }
    
    console.log('\n📊 Other fields:');
    console.log('   Category:', result.category);
    console.log('   Breaking Changes:', result.breaking_changes);
    console.log('   Migration Notes:', result.migration_notes || 'None');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

console.log('AI Highlights Generation Test');
console.log('============================\n');

testAIHighlights();