const AIProvider = require('./lib/ai-provider.js');

async function testAIProvider() {
  try {
    console.log('Testing AI Provider...');
    const aiProvider = new AIProvider();
    
    // Test connection first
    console.log('Testing connection...');
    const connectionTest = await aiProvider.testConnection();
    console.log('Connection test result:', connectionTest);
    
    // Test changelog generation
    const testIssue = {
      key: 'TEST-123',
      fields: {
        summary: 'Add customer dashboard widget',
        description: 'Added new analytics widget to customer dashboard for better visibility',
        status: { name: 'Done', id: '10001' },
        priority: { name: 'High', id: '2' },
        labels: ['customer-facing'],
        components: [{ name: 'Frontend' }],
        assignee: { displayName: 'John Doe', emailAddress: 'john@example.com' },
        reporter: { displayName: 'Jane Smith', emailAddress: 'jane@example.com' },
        created: '2025-01-30T10:00:00.000Z',
        updated: '2025-01-30T15:00:00.000Z'
      }
    };
    
    console.log('Testing changelog generation...');
    const changelogResult = await aiProvider.generateChangelogEntry(testIssue);
    console.log('Changelog result:', changelogResult);
    
  } catch (error) {
    console.error('AI Provider test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIProvider();