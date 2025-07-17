// test-live-webhook-debug.js
require('dotenv').config({ path: '.env.local' });

async function testLiveWebhook() {
  const WEBHOOK_URL = 'https://customer-intelligence-platform-jopke3ajc-skotter-1947s-projects.vercel.app/api/grain-webhook';
  
  // First test GET request to see environment status
  try {
    console.log('Testing GET request for environment status...');
    const getResponse = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    
    const getResult = await getResponse.json();
    console.log('GET response:', getResult);
    
  } catch (error) {
    console.error('GET test failed:', error);
  }
  
  // Then test POST request
  const testPayload = {
    meeting_title: "Live Webhook Test",
    transcript: "Testing the deployed webhook endpoint",
    date: "2024-07-15T10:00:00Z",
    grain_id: "live-test-123"
  };

  try {
    console.log('\nTesting POST request...');
    console.log('URL:', WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('POST Response status:', response.status);
    
    const responseText = await response.text();
    console.log('POST Response body:', responseText);
    
  } catch (error) {
    console.error('POST test failed:', error);
  }
}

testLiveWebhook();