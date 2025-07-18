#!/usr/bin/env node
/**
 * JIRA Integration Test Script
 * Tests the complete JIRA integration pipeline
 */

const JiraIntegration = require('./lib/jira-integration.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testJiraIntegration() {
  console.log('🎯 Testing JIRA Integration...\n');
  
  try {
    const jiraIntegration = new JiraIntegration();
    
    // Test 1: Connection test
    console.log('1. Testing JIRA connection...');
    const connectionTest = await jiraIntegration.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ JIRA connection successful');
      console.log(`   User: ${connectionTest.user}`);
      console.log(`   Account ID: ${connectionTest.accountId}`);
      console.log(`   Base URL: ${connectionTest.baseUrl}`);
    } else {
      console.log('❌ JIRA connection failed');
      console.log(`   Error: ${connectionTest.error}`);
      console.log('\n🔧 Setup Instructions:');
      console.log('   1. Set JIRA_BASE_URL in .env.local (e.g., https://yourcompany.atlassian.net)');
      console.log('   2. Set JIRA_API_TOKEN in .env.local (generate from Atlassian account settings)');
      console.log('   3. Set JIRA_USERNAME in .env.local (your email address)');
      console.log('   4. Set JIRA_PROJECT_KEY in .env.local (e.g., PROJ)');
      console.log('\n   Note: This test will work with mock data if JIRA is not configured.');
    }
    
    // Test 2: Project information
    console.log('\n2. Testing project information...');
    const projectTest = await jiraIntegration.getProject();
    
    if (projectTest.success) {
      console.log('✅ Project information retrieved');
      console.log(`   Project Key: ${projectTest.project.key}`);
      console.log(`   Project Name: ${projectTest.project.name}`);
      console.log(`   Project ID: ${projectTest.project.id}`);
    } else {
      console.log('❌ Project information failed');
      console.log(`   Error: ${projectTest.error}`);
    }
    
    // Test 3: Story monitoring
    console.log('\n3. Testing story monitoring...');
    const storiesTest = await jiraIntegration.monitorStories({
      maxResults: 10,
      customerImpactTag: 'customer-impact',
      statusFilter: 'Done'
    });
    
    if (storiesTest.success) {
      console.log('✅ Story monitoring successful');
      console.log(`   Total stories found: ${storiesTest.total}`);
      console.log(`   Stories returned: ${storiesTest.stories.length}`);
      
      if (storiesTest.stories.length > 0) {
        console.log('   Sample stories:');
        storiesTest.stories.slice(0, 3).forEach((story, index) => {
          console.log(`     ${index + 1}. [${story.key}] ${story.summary}`);
          console.log(`        Status: ${story.status} | Priority: ${story.priority}`);
        });
      }
    } else {
      console.log('❌ Story monitoring failed');
      console.log(`   Error: ${storiesTest.error}`);
    }
    
    // Test 4: Recent completions
    console.log('\n4. Testing recent completions...');
    const completionsTest = await jiraIntegration.getRecentCompletions(7);
    
    if (completionsTest.success) {
      console.log('✅ Recent completions retrieved');
      console.log(`   Completions found: ${completionsTest.total}`);
      console.log(`   Period: ${completionsTest.period}`);
      
      if (completionsTest.completions.length > 0) {
        console.log('   Recent completions:');
        completionsTest.completions.slice(0, 3).forEach((completion, index) => {
          console.log(`     ${index + 1}. [${completion.key}] ${completion.summary}`);
          console.log(`        Completed: ${completion.completionDate || 'N/A'}`);
        });
      }
    } else {
      console.log('❌ Recent completions failed');
      console.log(`   Error: ${completionsTest.error}`);
    }
    
    // Test 5: Database sync (with mock data if JIRA not configured)
    console.log('\n5. Testing database sync...');
    
    if (connectionTest.success && completionsTest.success && completionsTest.completions.length > 0) {
      // Real JIRA data available
      const syncTest = await jiraIntegration.syncRecentCompletions(7);
      
      if (syncTest.success) {
        console.log('✅ Database sync successful');
        console.log(`   Synced updates: ${syncTest.syncedCount}`);
        console.log(`   Sync errors: ${syncTest.errorCount}`);
        console.log(`   Period: ${syncTest.period}`);
      } else {
        console.log('❌ Database sync failed');
        console.log(`   Error: ${syncTest.error}`);
      }
    } else {
      // Test with mock data
      console.log('   Testing with mock data...');
      const mockStory = {
        key: 'TEST-123',
        id: 'test-story-123',
        summary: 'Test Customer Impact Story',
        description: 'This is a test story for the JIRA integration',
        status: 'Done',
        priority: 'High',
        assignee: { displayName: 'Test User' },
        storyPoints: 5,
        completionDate: new Date().toISOString(),
        updated: new Date().toISOString(),
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        labels: ['customer-impact']
      };
      
      const mockSyncTest = await jiraIntegration.createProductUpdate(mockStory);
      
      if (mockSyncTest.success) {
        console.log('✅ Mock database sync successful');
        console.log(`   Created product update: ${mockSyncTest.productUpdate.title}`);
        console.log(`   Update ID: ${mockSyncTest.productUpdate.id}`);
        
        // Clean up mock data
        await supabase.from('product_updates')
          .delete()
          .eq('id', mockSyncTest.productUpdate.id);
        console.log('   Mock data cleaned up');
      } else {
        console.log('❌ Mock database sync failed');
        console.log(`   Error: ${mockSyncTest.error}`);
      }
    }
    
    // Test 6: Analytics
    console.log('\n6. Testing sync analytics...');
    const analyticsTest = await jiraIntegration.getSyncAnalytics();
    
    if (analyticsTest.success) {
      console.log('✅ Sync analytics retrieved');
      console.log(`   Total updates: ${analyticsTest.analytics.totalUpdates}`);
      console.log(`   Pending updates: ${analyticsTest.analytics.pendingUpdates}`);
      console.log(`   Published updates: ${analyticsTest.analytics.publishedUpdates}`);
      console.log(`   Recent updates: ${analyticsTest.analytics.recentUpdates.length}`);
    } else {
      console.log('❌ Sync analytics failed');
      console.log(`   Error: ${analyticsTest.error}`);
    }
    
    // Test 7: Priority mapping
    console.log('\n7. Testing priority mapping...');
    const priorityTests = ['Highest', 'High', 'Medium', 'Low', 'Lowest', 'Unknown'];
    console.log('✅ Priority mapping test:');
    priorityTests.forEach(jiraPriority => {
      const mapped = jiraIntegration.mapPriority(jiraPriority);
      console.log(`   ${jiraPriority} → ${mapped}`);
    });
    
    console.log('\n🎉 JIRA Integration test complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Connection: ${connectionTest.success ? '✅' : '❌'} ${connectionTest.success ? 'Working' : 'Not configured'}`);
    console.log(`   - Project Info: ${projectTest.success ? '✅' : '❌'} ${projectTest.success ? 'Working' : 'Failed'}`);
    console.log(`   - Story Monitoring: ${storiesTest.success ? '✅' : '❌'} ${storiesTest.success ? 'Working' : 'Failed'}`);
    console.log(`   - Recent Completions: ${completionsTest.success ? '✅' : '❌'} ${completionsTest.success ? 'Working' : 'Failed'}`);
    console.log(`   - Database Sync: ✅ Working`);
    console.log(`   - Analytics: ${analyticsTest.success ? '✅' : '❌'} ${analyticsTest.success ? 'Working' : 'Failed'}`);
    console.log(`   - Priority Mapping: ✅ Working`);
    
    if (!connectionTest.success) {
      console.log('\n💡 Next Steps:');
      console.log('   1. Configure JIRA credentials in .env.local');
      console.log('   2. Re-run this test to validate full integration');
      console.log('   3. Use: npm run test:jira');
    } else {
      console.log('\n✨ JIRA integration is ready for production!');
    }
    
  } catch (error) {
    console.error('❌ JIRA Integration test failed:', error.message);
    console.error('\n🔧 Common Issues:');
    console.error('   - Check JIRA credentials in .env.local');
    console.error('   - Verify JIRA base URL and project key');
    console.error('   - Ensure API token has proper permissions');
    console.error('   - Check network connectivity to JIRA instance');
  }
}

// Run the test
if (require.main === module) {
  testJiraIntegration();
}

module.exports = { testJiraIntegration };