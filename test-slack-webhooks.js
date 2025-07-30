const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Your webhook URLs from .env.local
const webhooks = {
  approvals: process.env.SLACK_WEBHOOK_APPROVALS,
  updates: process.env.SLACK_WEBHOOK_UPDATES,
  insights: process.env.SLACK_WEBHOOK_INSIGHTS,
  content: process.env.SLACK_WEBHOOK_CONTENT
};

console.log('🧪 Testing Slack Webhooks...\n');

async function testWebhook(name, url, message) {
  console.log(`Testing ${name} webhook...`);
  
  if (!url) {
    console.log(`❌ ${name}: No webhook URL found in .env.local\n`);
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      console.log(`✅ ${name}: Message sent successfully`);
      console.log(`📝 Message: ${message.text}\n`);
    } else {
      console.log(`❌ ${name}: Failed with status ${response.status}`);
      const error = await response.text();
      console.log(`Error: ${error}\n`);
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}\n`);
  }
}

async function testAllWebhooks() {
  // Test 1: Simple text message
  console.log('🔍 Test 1: Simple Text Messages\n');
  
  await testWebhook('Approvals', webhooks.approvals, {
    text: '🔍 **New Content Ready for Review**\n\n**Title:** Test Content\n**Type:** Blog Post\n**Quality Score:** 95%\n\n**Summary:** This is a test approval request\n\n[View Content](http://localhost:3001/approval)',
    username: 'Content Pipeline Bot',
    icon_emoji: ':memo:'
  });

  await testWebhook('Updates', webhooks.updates, {
    text: '🚀 **New Product Update Published**\n\n**Feature:** Test Feature\n**JIRA Ticket:** TEST-123\n**Completed by:** Development Team\n\n**What Changed:**\nAdded test functionality\n\n[View Update](http://localhost:3001/product)',
    username: 'Content Pipeline Bot',
    icon_emoji: ':rocket:'
  });

  await testWebhook('Insights', webhooks.insights, {
    text: '🚨 **High-Priority Customer Insight Detected**\n\n**Customer:** Test Corp\n**Meeting:** Product Demo\n**Priority Score:** 9/10\n\n**Key Insight:**\n> Customer needs bulk export feature urgently\n\n[View Analysis](http://localhost:3001/meetings)',
    username: 'Content Pipeline Bot',
    icon_emoji: ':warning:'
  });

  await testWebhook('Content', webhooks.content, {
    text: '📊 **Daily Content Pipeline Summary**\n\n**Today\'s Activity:**\n• Content Generated: 5\n• Pending Approval: 2\n• Published: 3\n• Average Quality: 88%\n\n[View Dashboard](http://localhost:3001)',
    username: 'Content Pipeline Bot',
    icon_emoji: ':chart_with_upwards_trend:'
  });

  // Test 2: Test your API endpoint
  console.log('🔍 Test 2: API Endpoint Test\n');
  
  try {
    const apiResponse = await fetch('http://localhost:3001/api/slack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send_notification',
        message: '/content',
        type: 'publish'
      })
    });

    const result = await apiResponse.json();
    console.log('📡 API Response:', result);
    
  } catch (error) {
    console.log('❌ API Test Failed:', error.message);
  }

  // Test 3: Test with template data
  console.log('\n🔍 Test 3: Template Data Test\n');
  
  try {
    const templateResponse = await fetch('http://localhost:3001/api/slack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send_notification',
        templateId: 'product-update-notification',
        type: 'publish',
        templateData: {
          updateTitle: 'Test Feature Launch',
          jiraKey: 'TEST-456',
          assignee: 'Development Team',
          updateDescription: 'We launched a new test feature for better user experience',
          customerImpact: 'Users can now test new functionality',
          changelogUrl: 'http://localhost:3001/product',
          jiraUrl: 'https://marq.atlassian.net/browse/TEST-456'
        }
      })
    });

    const templateResult = await templateResponse.json();
    console.log('📡 Template API Response:', templateResult);
    
  } catch (error) {
    console.log('❌ Template API Test Failed:', error.message);
  }
}

testAllWebhooks().then(() => {
  console.log('🏁 All tests completed!');
  console.log('\nCheck your Slack channels to see which messages appeared.');
}).catch(console.error);