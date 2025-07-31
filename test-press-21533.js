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
    id: "54883",
    key: "PRESS-21533",
    fields: {
      summary: "Debug PRESS-21533 webhook issue",
      description: "Testing why PRESS-21533 didn't populate in changelog.",
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
    id: "237693",
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

async function testPRESS21533() {
  const url = 'https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/jira-webhook';
  
  try {
    console.log('🧪 Testing PRESS-21533 webhook...\n');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JIRA-Test-Client/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.text();
    
    console.log(`📡 URL: ${url}`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📝 Response: ${data}\n`);
    
    if (response.status === 200) {
      try {
        const jsonResponse = JSON.parse(data);
        
        console.log('🔍 Detailed Response Analysis:');
        console.log(`   Success: ${jsonResponse.success}`);
        console.log(`   Message: ${jsonResponse.message}`);
        console.log(`   Changelog Created: ${jsonResponse.changelogCreated}`);
        
        if (jsonResponse.changelogCreated) {
          console.log('\n🎉 PRESS-21533 should have created a changelog entry!');
          console.log('📋 Check your changelog page: /changelog');
          console.log('💬 Check Slack for approval notification');
        } else {
          console.log('\n⚠️ Webhook processed but no changelog created');
          console.log('🔍 This might be due to duplicate detection or filtering');
        }
        
      } catch (parseError) {
        console.log('📝 Raw response (non-JSON):', data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPRESS21533();