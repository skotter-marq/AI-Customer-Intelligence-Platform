// test-live-webhook.js
require('dotenv').config({ path: '.env.local' });

async function testLiveWebhook() {
  const WEBHOOK_URL = 'https://customer-intelligence-platform-cn4l4p59t-skotter-1947s-projects.vercel.app/api/grain-webhook';
  
  const testPayload = {
    meeting_title: "Live Webhook Test",
    transcript: "Testing the deployed webhook endpoint",
    date: "2024-07-15T10:00:00Z",
    grain_id: "live-test-123"
  };

  try {
    console.log('Testing live webhook...');
    console.log('URL:', WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    console.log('✅ Live webhook response:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLiveWebhook();