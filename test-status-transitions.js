const fetch = require('node-fetch');

// Test different status transition scenarios
const testCases = [
  {
    name: "Valid: In Progress → Done",
    payload: {
      "webhookEvent": "jira:issue_updated",
      "issue": {
        "id": "test1",
        "key": "TEST-001",
        "fields": {
          "summary": "Test valid transition",
          "status": { "name": "Done", "statusCategory": { "key": "done" } },
          "priority": { "name": "High" },
          "labels": ["customer-facing"],
          "components": [{"name": "Frontend"}],
          "customfield_10000": "Customer Facing"
        }
      },
      "user": { "displayName": "Test User" },
      "changelog": {
        "items": [{
          "field": "status",
          "fromString": "In Progress",
          "toString": "Done",
          "fromStatusCategory": { "key": "indeterminate" },
          "toStatusCategory": { "key": "done" }
        }]
      }
    }
  },
  {
    name: "Invalid: Done → Closed (both done)",
    payload: {
      "webhookEvent": "jira:issue_updated",
      "issue": {
        "id": "test2",
        "key": "TEST-002",
        "fields": {
          "summary": "Test invalid transition",
          "status": { "name": "Closed", "statusCategory": { "key": "done" } },
          "priority": { "name": "High" },
          "labels": ["customer-facing"],
          "components": [{"name": "Frontend"}],
          "customfield_10000": "Customer Facing"
        }
      },
      "user": { "displayName": "Test User" },
      "changelog": {
        "items": [{
          "field": "status",
          "fromString": "Done",
          "toString": "Closed",
          "fromStatusCategory": { "key": "done" },
          "toStatusCategory": { "key": "done" }
        }]
      }
    }
  },
  {
    name: "Invalid: Done → In Progress (reopening)",
    payload: {
      "webhookEvent": "jira:issue_updated",
      "issue": {
        "id": "test3",
        "key": "TEST-003",
        "fields": {
          "summary": "Test reopening",
          "status": { "name": "In Progress", "statusCategory": { "key": "indeterminate" } },
          "priority": { "name": "High" },
          "labels": ["customer-facing"],
          "components": [{"name": "Frontend"}],
          "customfield_10000": "Customer Facing"
        }
      },
      "user": { "displayName": "Test User" },
      "changelog": {
        "items": [{
          "field": "status",
          "fromString": "Done",
          "toString": "In Progress",
          "fromStatusCategory": { "key": "done" },
          "toStatusCategory": { "key": "indeterminate" }
        }]
      }
    }
  },
  {
    name: "Valid: To Do → Closed",
    payload: {
      "webhookEvent": "jira:issue_updated",
      "issue": {
        "id": "test4",
        "key": "TEST-004",
        "fields": {
          "summary": "Test direct to closed",
          "status": { "name": "Closed", "statusCategory": { "key": "done" } },
          "priority": { "name": "High" },
          "labels": ["customer-facing"],
          "components": [{"name": "Frontend"}],
          "customfield_10000": "Customer Facing"
        }
      },
      "user": { "displayName": "Test User" },
      "changelog": {
        "items": [{
          "field": "status",
          "fromString": "To Do",
          "toString": "Closed",
          "fromStatusCategory": { "key": "new" },
          "toStatusCategory": { "key": "done" }
        }]
      }
    }
  }
];

async function testStatusTransitions() {
  console.log('🧪 Testing Status Transition Logic\n');
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/jira-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.payload)
      });
      
      const result = await response.json();
      
      if (result.success && result.changelogCreated) {
        console.log('✅ PROCESSED - Changelog created');
      } else if (result.success && !result.changelogCreated) {
        console.log('⏭️ SKIPPED - ' + result.message);
      } else {
        console.log('❌ FAILED - ' + result.message);
      }
      
    } catch (error) {
      console.log('❌ ERROR - ' + error.message);
    }
  }
  
  console.log('\n🏁 Status transition tests completed');
}

testStatusTransitions();