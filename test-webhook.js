// test-webhook.js
require('dotenv').config({ path: '.env.local' });

async function testWebhook() {
  const testPayload = {
    meeting_title: "Customer Discovery Call - TechCorp",
    transcript: "Hi Sarah, thanks for taking the time today. We're really struggling with brand consistency across our marketing materials. Our team spends hours trying to find the right templates and it's becoming a real bottleneck for our campaigns.",
    date: "2024-07-15T10:00:00Z",
    participants: [
      { name: "Sarah Johnson", email: "sarah@techcorp.com" },
      { name: "You", email: "you@yourcompany.com" }
    ],
    duration_minutes: 30,
    tags: ["customer", "discovery"],
    grain_id: "test-meeting-123"
  };

  try {
    console.log('Testing webhook...');
    
    const response = await fetch('http://localhost:3000/api/grain-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    console.log('✅ Webhook response:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWebhook();