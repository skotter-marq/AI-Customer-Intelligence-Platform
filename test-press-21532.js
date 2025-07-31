#!/usr/bin/env node

const testPayload = {
  timestamp: Date.now(),
  webhookEvent: "jira:issue_updated",
  issue_event_type_name: "issue_generic",
  user: {
    displayName: "Spencer Kotter",
    emailAddress: "spencer@example.com"
  },
  issue: {
    id: "54882",
    key: "PRESS-21532",
    fields: {
      summary: "Test webhook with correct URL",
      description: "Testing PRESS-21532 with the correct Vercel URL.",
      status: {
        name: "Done",
        id: "6",
        statusCategory: {
          key: "done",
          name: "Complete"
        }
      },
      priority: {
        name: "Medium",
        id: "10001"
      },
      labels: [],
      components: [],
      assignee: null,
      reporter: {
        displayName: "Spencer Kotter",
        emailAddress: "spencer@example.com"
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
  },
  changelog: {
    id: "237692",
    items: [
      {
        field: "status",
        fieldtype: "jira",
        fieldId: "status",
        from: "10002",
        fromString: "To Do",
        to: "6",
        toString: "Done"
      }
    ]
  }
};

async function testCorrectUrl() {
  const url = 'https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/jira-webhook';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JIRA-Test-Client/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.text();
    
    console.log('🎯 Testing PRESS-21532 with correct URL:');
    console.log(`📡 URL: ${url}`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📝 Response: ${data}`);
    
    if (response.status === 200) {
      console.log('\n🎉 SUCCESS! Webhook processed PRESS-21532');
      console.log('🔧 Update your JIRA webhook to this URL');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCorrectUrl();