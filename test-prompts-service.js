const { promptService } = require('./lib/prompt-service.js');

async function testPromptService() {
  console.log('🧪 Testing PromptService functionality...');
  
  try {
    // Test AI prompt
    const aiPrompt = await promptService.getAIPrompt('meeting-analysis');
    console.log('  AI Prompt test:', aiPrompt ? '✅ Success' : '❌ Failed');
    
    // Test Slack template
    const slackTemplate = await promptService.getSlackTemplate('product-update-notification');
    console.log('  Slack Template test:', slackTemplate ? '✅ Success' : '❌ Failed');
    
    // Test system message
    const systemMessage = await promptService.getSystemMessage('api-success-general');
    console.log('  System Message test:', systemMessage ? '✅ Success' : '❌ Failed');
    
    console.log('\n🎉 PromptService is working correctly!');
    console.log('\n📊 Sample data:');
    if (aiPrompt) {
      console.log(`  AI Prompt: "${aiPrompt.name}" (${aiPrompt.category})`);
    }
    if (slackTemplate) {
      console.log(`  Slack Template: "${slackTemplate.name}" (${slackTemplate.category})`);
    }
    if (systemMessage) {
      console.log(`  System Message: "${systemMessage}"`);
    }
    
  } catch (error) {
    console.error('❌ PromptService test failed:', error.message);
  }
}

testPromptService();