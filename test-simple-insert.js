const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSimpleInsert() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test with only the most basic required columns
    const minimalEntry = {
      content_title: 'Test JIRA Entry - Minimal',
      generated_content: 'This is a test changelog entry from JIRA webhook',
      content_type: 'changelog_entry',
      content_format: 'markdown', // Required field - NOT NULL constraint
      status: 'draft',
      created_at: new Date().toISOString()
    };
    
    console.log('Testing minimal insert...');
    const { data, error } = await supabase
      .from('generated_content')
      .insert(minimalEntry)
      .select()
      .single();
    
    if (error) {
      console.error('Minimal insert failed:', error);
      return false;
    }
    
    console.log('✅ Minimal insert successful:', data.id);
    
    // Now test with more fields one by one
    const expandedEntry = {
      content_title: 'Test JIRA Entry - Expanded',
      generated_content: 'This is a test changelog entry with more fields',
      content_type: 'changelog_entry',
      content_format: 'markdown',
      target_audience: 'customers',
      status: 'draft',
      quality_score: 0.85,
      created_at: new Date().toISOString()
    };
    
    console.log('Testing expanded insert...');
    const { data: expandedData, error: expandedError } = await supabase
      .from('generated_content')
      .insert(expandedEntry)
      .select()
      .single();
    
    if (expandedError) {
      console.error('Expanded insert failed:', expandedError);
    } else {
      console.log('✅ Expanded insert successful:', expandedData.id);
    }
    
    // Test with JSONB fields
    const jsonbEntry = {
      content_title: 'Test JIRA Entry - With JSONB',
      generated_content: 'This is a test with JSONB fields',
      content_type: 'changelog_entry',
      content_format: 'markdown',
      status: 'draft',
      source_data: {
        jira_story_key: 'TEST-123',
        category: 'Added'
      },
      generation_metadata: {
        auto_generated: true,
        source: 'jira_webhook'
      },
      created_at: new Date().toISOString()
    };
    
    console.log('Testing JSONB insert...');
    const { data: jsonbData, error: jsonbError } = await supabase
      .from('generated_content')
      .insert(jsonbEntry)
      .select()
      .single();
    
    if (jsonbError) {
      console.error('JSONB insert failed:', jsonbError);
    } else {
      console.log('✅ JSONB insert successful:', jsonbData.id);
    }
    
    // Clean up test entries
    await supabase
      .from('generated_content')
      .delete()
      .or(`id.eq.${data.id},id.eq.${expandedData?.id || 'null'},id.eq.${jsonbData?.id || 'null'}`);
    
    console.log('✅ Test entries cleaned up');
    return true;
    
  } catch (error) {
    console.error('Test error:', error.message);
    return false;
  }
}

testSimpleInsert();