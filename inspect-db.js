#!/usr/bin/env node

/**
 * Inspect database to debug highlights storage
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function inspectDatabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔍 Inspecting database for highlights storage...\n');
    
    // Get the latest entries
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    entries.forEach((entry, index) => {
      console.log(`📋 Entry ${index + 1}:`);
      console.log(`   ID: ${entry.id}`);
      console.log(`   Title: ${entry.content_title}`);
      console.log(`   Created: ${entry.created_at}`);
      
      const sourceData = entry.source_data || {};
      console.log(`   JIRA Key: ${sourceData.jira_story_key}`);
      console.log(`   Source Data Highlights Type: ${typeof sourceData.highlights}`);
      console.log(`   Source Data Highlights:`, JSON.stringify(sourceData.highlights, null, 4));
      
      console.log(`   TL;DR Bullet Points Type: ${typeof entry.tldr_bullet_points}`);
      console.log(`   TL;DR Bullet Points:`, JSON.stringify(entry.tldr_bullet_points, null, 4));
      
      console.log(''); // Empty line for readability
    });
    
  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
  }
}

console.log('Database Inspection Tool');
console.log('=======================\n');

inspectDatabase();