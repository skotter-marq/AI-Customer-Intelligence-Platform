const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseSave() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test changelog entry from the webhook
    const changelogEntry = {
      jira_story_key: 'TEST-123',
      jira_issue_id: '12345',
      version: 'TBD',
      category: 'Added',
      customer_facing_title: 'New analytics dashboard widget helps you track key metrics at a glance',
      customer_facing_description: "We've added a powerful new analytics widget to your dashboard that makes it easier to monitor your most important metrics. Get instant visibility into your key data without leaving your main dashboard view.",
      highlights: [
        'Quick access to your essential analytics from the dashboard',
        'Real-time data updates keep you informed',
        'Customizable view to focus on metrics that matter most to you'
      ],
      breaking_changes: false,
      migration_notes: '',
      technical_summary: 'Add customer dashboard widget',
      technical_description: 'Added new analytics widget to customer dashboard for better visibility',
      priority: 'high',
      affected_users: 5000,
      approval_status: 'pending',
      public_visibility: false,
      created_by: 'John Doe',
      created_at: new Date().toISOString(),
      jira_status: 'Done',
      assignee: 'John Doe',
      labels: ['customer-facing'],
      components: ['Frontend']
    };
    
    console.log('Testing database save...');
    console.log('Changelog entry:', changelogEntry);
    
    // Test the exact save operation from the webhook
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        content_title: changelogEntry.customer_facing_title,
        generated_content: changelogEntry.customer_facing_description,
        content_type: 'changelog_entry',
        target_audience: 'customers',
        status: 'pending_approval',
        approval_status: 'pending',
        quality_score: 0.85,
        tldr_summary: changelogEntry.customer_facing_title,
        tldr_bullet_points: changelogEntry.highlights,
        update_category: changelogEntry.category.toLowerCase(),
        importance_score: changelogEntry.priority === 'critical' ? 0.9 : 0.7,
        breaking_changes: changelogEntry.breaking_changes,
        tags: [
          changelogEntry.jira_story_key,
          changelogEntry.category.toLowerCase(),
          'auto-generated'
        ],
        is_public: false,
        public_changelog_visible: false,
        created_at: new Date().toISOString(),
        metadata: {
          jira_story_key: changelogEntry.jira_story_key,
          jira_issue_id: changelogEntry.jira_issue_id,
          estimated_users: changelogEntry.affected_users,
          technical_summary: changelogEntry.technical_summary,
          assignee: changelogEntry.assignee,
          components: changelogEntry.components,
          labels: changelogEntry.labels
        }
      });
    
    if (error) {
      console.error('Database save error:', error);
      throw error;
    }
    
    console.log('✅ Database save successful:', data);
    
    // Verify it was saved
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (retrieveError) {
      console.error('Retrieve error:', retrieveError);
    } else {
      console.log('Retrieved entries:', retrievedData?.length, 'entries');
      console.log('Latest entry:', retrievedData?.[0]);
    }
    
  } catch (error) {
    console.error('Database test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabaseSave();