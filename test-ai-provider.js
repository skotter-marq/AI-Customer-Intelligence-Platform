#!/usr/bin/env node
/**
 * AI Provider Test Script
 * Tests the AI provider integration and analysis capabilities
 */

const AIProvider = require('./lib/ai-provider.js');
require('dotenv').config({ path: '.env.local' });

async function testAIProvider() {
  console.log('🤖 Testing AI Provider Integration...\n');
  
  try {
    const ai = new AIProvider();
    
    // Test 1: Connection test
    console.log('1. Testing AI connection...');
    const connectionResult = await ai.testConnection();
    
    if (connectionResult.success) {
      console.log('✅ AI connection successful');
      console.log(`   Provider: ${connectionResult.provider}`);
      console.log(`   Model: ${connectionResult.model}`);
      console.log(`   Response: ${connectionResult.response}`);
    } else {
      console.log('❌ AI connection failed:', connectionResult.error);
      return;
    }
    
    // Test 2: Sample transcript analysis
    console.log('\n2. Testing transcript analysis...');
    const sampleTranscript = `
    Customer: Hi, I wanted to discuss some issues we've been having with the reporting dashboard.
    
    Sales Rep: Of course! What specific issues are you experiencing?
    
    Customer: Well, the main problem is that it takes forever to load. Sometimes 15-20 seconds just to see our basic metrics. Our team needs to check these numbers multiple times a day, so it's really slowing us down.
    
    Sales Rep: I understand that's frustrating. Are there any other concerns?
    
    Customer: Yes, actually. We'd love to see more granular filtering options. Right now we can only filter by month, but we need daily and weekly views too. Also, it would be amazing if we could export these reports directly to Excel.
    
    Sales Rep: Those are great suggestions. Let me make sure our product team hears about these.
    
    Customer: That would be wonderful. Oh, and one more thing - we're really happy with the customer support. Your team has been incredibly responsive.
    `;
    
    const meetingContext = {
      company: 'Acme Corp',
      meetingType: 'customer_review',
      date: '2024-07-17',
      participants: 'John Smith (Customer), Sarah Johnson (Sales Rep)'
    };
    
    const analysis = await ai.analyzeTranscript(sampleTranscript, meetingContext);
    
    console.log('✅ Transcript analysis successful');
    console.log(`   Found ${analysis.insights.length} insights`);
    console.log(`   Overall sentiment: ${analysis.overall_sentiment}`);
    console.log('   Key insights:');
    
    analysis.insights.forEach((insight, index) => {
      console.log(`     ${index + 1}. [${insight.type}] ${insight.title}`);
      console.log(`        Priority: ${insight.priority} | Confidence: ${insight.confidence_score}`);
    });
    
    // Test 3: Follow-up actions generation
    console.log('\n3. Testing follow-up actions generation...');
    const followUpActions = await ai.generateFollowUpActions(analysis.insights, {
      company: 'Acme Corp',
      account_manager: 'Sarah Johnson',
      customer_tier: 'Enterprise'
    });
    
    console.log('✅ Follow-up actions generated');
    console.log(`   Generated ${followUpActions.actions.length} actions:`);
    
    followUpActions.actions.forEach((action, index) => {
      console.log(`     ${index + 1}. [${action.type}] ${action.title}`);
      console.log(`        Priority: ${action.priority} | Due: ${action.due_date}`);
    });
    
    console.log('\n🎉 AI Provider test complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Provider: ${connectionResult.provider}`);
    console.log(`   - Connection: ✅ Working`);
    console.log(`   - Transcript Analysis: ✅ Working`);
    console.log(`   - Follow-up Generation: ✅ Working`);
    
  } catch (error) {
    console.error('❌ AI Provider test failed:', error.message);
    console.error('\n🔧 Setup Instructions:');
    console.error('   1. Add AI provider credentials to .env.local:');
    console.error('      OPENAI_API_KEY=your_openai_key');
    console.error('      # OR');
    console.error('      ANTHROPIC_API_KEY=your_claude_key');
    console.error('   2. Optional: Set preferred provider:');
    console.error('      AI_PROVIDER=openai  # or "claude"');
    console.error('   3. Run: npm install openai @anthropic-ai/sdk');
  }
}

// Run the test
if (require.main === module) {
  testAIProvider();
}

module.exports = { testAIProvider };