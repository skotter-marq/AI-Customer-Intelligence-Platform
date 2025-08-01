#!/usr/bin/env node

/**
 * Test JIRA Webhook with sample payload to verify changelog generation
 */

require('dotenv').config({ path: '.env.local' });

async function testJiraWebhook() {
  // Sample JIRA webhook payload that represents a story completion
  const testPayload = {
    webhookEvent: 'jira:issue_updated',
    user: {
      accountId: 'test-user-123',
      displayName: 'Test User',
      emailAddress: 'test@example.com'
    },
    issue: {
      id: '12345',
      key: 'PRESS-21503',
      fields: {
        summary: 'Enhanced user authentication with multi-factor support',
        description: 'Implemented comprehensive multi-factor authentication system including SMS, email, and authenticator app support. This includes enhanced session management, automatic timeout handling, and improved security logging for audit trails.',
        status: {
          name: 'Done',
          statusCategory: {
            key: 'done'
          }
        },
        priority: {
          name: 'High'
        },
        assignee: {
          displayName: 'John Developer',
          emailAddress: 'john@example.com'
        },
        components: [
          { name: 'Frontend' },
          { name: 'Security' }
        ],
        labels: ['customer-impact', 'security', 'authentication']
      }
    },
    changelog: {
      items: [
        {
          field: 'status',
          fromString: 'In Review',
          toString: 'Done',
          from: '10003',
          to: '10004',
          fromStatusCategory: {
            key: 'indeterminate'
          },
          toStatusCategory: {
            key: 'done'
          }
        }
      ]
    }
  };

  try {
    console.log('🧪 Testing JIRA webhook with sample payload...\n');
    console.log(`🎫 Test Issue: ${testPayload.issue.key}`);
    console.log(`📋 Summary: ${testPayload.issue.fields.summary}`);
    console.log(`🔄 Status Change: ${testPayload.changelog.items[0].fromString} → ${testPayload.changelog.items[0].toString}\n`);
    
    const response = await fetch('http://localhost:3001/api/jira-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook response:', result);
      console.log('\n🔍 Next steps:');
      console.log('   1. Check the generated_content table in Supabase');
      console.log('   2. Look for highlights in source_data.highlights');
      console.log('   3. Check if the entry appears in the approval dashboard');
    } else {
      console.log('❌ Webhook failed:', response.status, result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your dev server is running: npm run dev');
  }
}

console.log('JIRA Webhook Test');
console.log('================');
console.log('This will test the JIRA webhook with a sample story completion payload.\n');

testJiraWebhook();