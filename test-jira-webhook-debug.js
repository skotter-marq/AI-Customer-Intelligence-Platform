#!/usr/bin/env node

const https = require('https');

// Test payload similar to JIRA webhook for PRESS-21531
const testPayload = {
  timestamp: Date.now(),
  webhookEvent: "jira:issue_updated",
  issue_event_type_name: "issue_generic",
  user: {
    displayName: "Spencer Kotter",
    emailAddress: "spencer@example.com"
  },
  issue: {
    id: "54881",
    key: "PRESS-21531",
    fields: {
      summary: "Testing Status Done Update",
      description: "Testing to see if PRESS-21531 webhook triggers correctly.",
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
    id: "237691",
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

// Test multiple possible webhook URLs
const testUrls = [
  'https://customer-intelligence-platform.vercel.app/api/jira-webhook',
  'http://localhost:3000/api/jira-webhook'
];

async function testWebhook(url) {
  return new Promise((resolve, reject) => {
    const urlParts = new URL(url);
    const postData = JSON.stringify(testPayload);
    
    const options = {
      hostname: urlParts.hostname,
      port: urlParts.port || (urlParts.protocol === 'https:' ? 443 : 80),
      path: urlParts.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'JIRA-Test-Client/1.0'
      }
    };

    const protocol = urlParts.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (e) => {
      reject({
        url,
        error: e.message,
        code: e.code
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        url,
        error: 'Request timeout',
        code: 'TIMEOUT'
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing JIRA Webhook Endpoints for PRESS-21531...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const result = await testWebhook(url);
      
      console.log(`✅ Status: ${result.status}`);
      console.log(`📝 Response: ${result.body.substring(0, 200)}${result.body.length > 200 ? '...' : ''}`);
      
      if (result.status === 200) {
        console.log('🎉 Webhook endpoint is responding correctly!');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.error} (${error.code})`);
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('\n🔍 Debugging Tips:');
  console.log('1. Check Vercel deployment status in dashboard');
  console.log('2. Verify JIRA webhook is configured to POST to the correct URL');
  console.log('3. Check Vercel function logs for any errors');
  console.log('4. Ensure environment variables are set in Vercel');
}

runTests().catch(console.error);