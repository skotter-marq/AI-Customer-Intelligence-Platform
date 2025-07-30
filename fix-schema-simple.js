const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixSchema() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Testing current generated_content structure...');
    
    // First, test with a simple insert that should work with existing columns
    const testEntry = {
      content_title: 'Test JIRA Entry',
      generated_content: 'Test content from JIRA webhook',
      content_type: 'changelog_entry',
      target_audience: 'customers',
      status: 'draft', // Using the existing 'status' column instead of 'approval_status'
      quality_score: 0.85,
      tldr_summary: 'Test JIRA Entry',
      tldr_bullet_points: ['Test bullet point'],
      is_public: false, // This might fail if column doesn't exist
      created_at: new Date().toISOString()
    };
    
    console.log('Attempting to insert test entry...');
    const { data, error } = await supabase
      .from('generated_content')
      .insert(testEntry)
      .select()
      .single();
    
    if (error) {
      console.error('Insert failed:', error);
      console.log('The schema needs to be updated manually in Supabase dashboard');
      
      console.log('\n🛠️  MANUAL FIX NEEDED:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run this SQL:');
      console.log(`
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_changelog_visible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS version TEXT,
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS breaking_changes BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS migration_notes TEXT,
ADD COLUMN IF NOT EXISTS update_category TEXT,
ADD COLUMN IF NOT EXISTS importance_score DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS affected_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_generated_content_approval_status ON generated_content(approval_status);
CREATE INDEX IF NOT EXISTS idx_generated_content_is_public ON generated_content(is_public) WHERE is_public = true;
      `);
      
      return false;
    }
    
    console.log('✅ Test entry inserted successfully:', data);
    
    // Clean up test entry
    await supabase
      .from('generated_content')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Schema appears to be working correctly');
    return true;
    
  } catch (error) {
    console.error('Schema test error:', error.message);
    return false;
  }
}

fixSchema();