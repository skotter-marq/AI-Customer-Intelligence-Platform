// Test the new JIRA API routes
const baseUrl = 'http://localhost:3001';

async function testJiraAPI() {
  console.log('🧪 Testing JIRA API Routes\n');

  try {
    // Test GET /api/jira/sync
    console.log('1️⃣ Testing JIRA sync endpoint...');
    const syncResponse = await fetch(`${baseUrl}/api/jira/sync`);
    const syncData = await syncResponse.json();
    
    if (syncResponse.ok) {
      console.log('✅ JIRA sync endpoint working');
      console.log(`   Found ${syncData.data?.length || 0} product updates`);
    } else {
      console.log('❌ JIRA sync endpoint failed:', syncData.error);
    }

    // Test GET /api/jira/issues
    console.log('\n2️⃣ Testing JIRA issues endpoint...');
    const issuesResponse = await fetch(`${baseUrl}/api/jira/issues?project=PRESS&limit=10`);
    const issuesData = await issuesResponse.json();
    
    if (issuesResponse.ok) {
      console.log('✅ JIRA issues endpoint working');
      console.log(`   Found ${issuesData.total} issues for project ${issuesData.project}`);
      
      if (issuesData.issues.length > 0) {
        console.log('   Sample issue:', issuesData.issues[0].key, '-', issuesData.issues[0].title);
      }
    } else {
      console.log('❌ JIRA issues endpoint failed:', issuesData.error);
    }

    // Test webhook simulation
    console.log('\n3️⃣ Testing JIRA webhook simulation...');
    const webhookPayload = {
      webhookEvent: 'jira:issue_updated',
      issue: {
        key: 'PRESS-123',
        fields: {
          summary: 'Test Customer Feature Implementation',
          description: 'This is a test customer-facing feature',
          status: { name: 'Done' },
          labels: [{ name: 'customer-impact' }],
          reporter: { displayName: 'Test Reporter' },
          assignee: { displayName: 'Test Assignee' }
        }
      }
    };

    const webhookResponse = await fetch(`${baseUrl}/api/jira/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    
    const webhookData = await webhookResponse.json();
    
    if (webhookResponse.ok) {
      console.log('✅ JIRA webhook processing working');
      console.log('   Message:', webhookData.message);
    } else {
      console.log('❌ JIRA webhook processing failed:', webhookData.error);
    }

    console.log('\n🎉 JIRA API testing complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
  }
}

testJiraAPI();