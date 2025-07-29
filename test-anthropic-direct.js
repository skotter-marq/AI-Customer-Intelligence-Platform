const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

async function testAnthropicDirect() {
  console.log('🧪 Testing Anthropic SDK directly...');
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key prefix:', process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...');
  
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    console.log('✅ Anthropic client created');
    console.log('Client object:', typeof anthropic);
    console.log('Messages method exists:', typeof anthropic.messages);
    
    if (anthropic.messages && typeof anthropic.messages.create === 'function') {
      console.log('🚀 Testing API call...');
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Hello! Just testing the connection.' }]
      });
      
      console.log('✅ API call successful!');
      console.log('Response:', response.content[0].text);
    } else {
      console.log('❌ Messages method not available');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testAnthropicDirect().catch(console.error);