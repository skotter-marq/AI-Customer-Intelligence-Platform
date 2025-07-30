const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkChangelogEntries() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Checking for changelog entries in database...');
    
    // Query for changelog entries
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Database query failed:', error);
      return;
    }
    
    console.log(`✅ Found ${data.length} changelog entries:`);
    
    data.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.content_title}`);
      console.log(`   Status: ${entry.status}`);
      console.log(`   Created: ${entry.created_at}`);
      console.log(`   Source: ${entry.source_data?.jira_story_key || 'N/A'}`);
      console.log(`   Content: ${entry.generated_content.substring(0, 100)}...`);
    });
    
    if (data.length === 0) {
      console.log('No changelog entries found. The JIRA webhook may not have saved properly.');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

checkChangelogEntries();