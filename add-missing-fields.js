#!/usr/bin/env node

/**
 * Add missing fields by working around the schema limitations
 * We'll use the existing fields and create a mapping
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function addMissingFields() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔧 Working around missing approval_status field...\n');
    
    // Since we can't add approval_status column, we'll work with what we have
    // We'll use the 'status' field and 'approved_by' field to determine approval
    
    // Get all changelog entries
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false});
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`📊 Found ${entries.length} changelog entries\n`);
    
    // Analyze and update entries to simulate approval status
    let updatedCount = 0;
    let qualifiedCount = 0;
    
    for (const entry of entries) {
      // Determine if this entry should be considered "approved"
      const isQualified = (
        entry.status === 'published' && 
        entry.quality_score >= 0.7 && 
        entry.content_title && 
        entry.generated_content &&
        !entry.content_title.toLowerCase().includes('test') &&
        !entry.content_title.toLowerCase().includes('internal') &&
        entry.content_title.trim().length > 10
      );
      
      if (isQualified) {
        qualifiedCount++;
        
        // Update the entry to mark it as approved using available fields
        const updates = {
          approved_by: 'admin_migration',
          // Use status to simulate approved status
          status: 'published'
        };
        
        // Set version if not present
        if (!entry.version) {
          const date = new Date(entry.created_at);
          updates.version = `v${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate()}`;
        }
        
        // Set release date if not present
        if (!entry.release_date) {
          updates.release_date = entry.created_at;
        }
        
        const { error: updateError } = await supabase
          .from('generated_content')
          .update(updates)
          .eq('id', entry.id);
        
        if (updateError) {
          console.error(`❌ Failed to update entry ${entry.id}:`, updateError);
        } else {
          console.log(`✅ Qualified: "${entry.content_title}"`);
          console.log(`   Quality: ${(entry.quality_score * 100).toFixed(0)}%`);
          console.log(`   Version: ${updates.version || entry.version}`);
          console.log('');
          updatedCount++;
        }
      } else {
        console.log(`⏸️ Skipped: "${entry.content_title}"`);
        console.log(`   Reason: ${entry.status !== 'published' ? 'not published' : 
                                  entry.quality_score < 0.7 ? 'low quality' :
                                  !entry.content_title ? 'no title' :
                                  'test/internal entry'}`);
        console.log('');
      }
    }
    
    console.log(`📊 Processing Summary:`);
    console.log(`   Total entries: ${entries.length}`);
    console.log(`   Qualified entries: ${qualifiedCount}`);
    console.log(`   Updated entries: ${updatedCount}`);
    
    if (updatedCount > 0) {
      console.log(`\n🚀 Next step: Run the public script to make these entries visible`);
      console.log(`   Command: node make-entries-public-simple.js`);
    }
    
  } catch (error) {
    console.error('❌ Failed to add missing fields:', error.message);
  }
}

console.log('Missing Fields Handler');
console.log('=====================\n');

addMissingFields();