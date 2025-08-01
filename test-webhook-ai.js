#!/usr/bin/env node

/**
 * Test AI Provider directly within webhook-like context
 */

require('dotenv').config({ path: '.env.local' });

async function testWebhookAI() {
  try {
    console.log('🧪 Testing AI provider in webhook context...\n');
    
    // Simulate the exact same call the webhook makes
    const AIProvider = require('./lib/ai-provider.js');
    const aiProvider = new AIProvider();
    
    console.log('🔍 AI Provider Configuration:');
    console.log('   Provider:', aiProvider.provider);
    console.log('   OpenAI Available:', !!aiProvider.openai);
    console.log('   Anthropic Available:', !!aiProvider.anthropic);
    console.log('');
    
    // Test the exact same issue the webhook is processing
    const issue = {
      key: 'PRESS-TEST-WEBHOOK',
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
    
    console.log('🤖 Calling AI provider with webhook issue...');
    const result = await aiProvider.generateChangelogEntry(issue);
    
    console.log('\n✅ AI Provider Response:');
    console.log('   Customer Title:', result.customer_title);
    console.log('   Category:', result.category);
    console.log('   Highlights Count:', result.highlights?.length || 0);
    console.log('   Highlights:', JSON.stringify(result.highlights, null, 2));
    
  } catch (error) {
    console.error('❌ Webhook AI test failed:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
}

console.log('Webhook AI Provider Test');
console.log('=======================\n');

testWebhookAI();