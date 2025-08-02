#!/usr/bin/env node

/**
 * Add approval_status to existing entries and update them to approved status
 * so they can be made public in the changelog
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixApprovalStatus() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔧 Fixing approval status for changelog entries...\n');
    
    // First, let's check if approval_status column exists by querying for it
    try {
      const { data: testQuery } = await supabase
        .from('generated_content')
        .select('approval_status')
        .limit(1);
      
      console.log('✅ approval_status column exists');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ approval_status column does not exist');
        console.log('📋 You need to manually add this column in Supabase SQL Editor:');
        console.log('ALTER TABLE generated_content ADD COLUMN approval_status TEXT DEFAULT \'pending\';');
        console.log('\nOnce added, run this script again.');
        return;
      }
      throw error;
    }
    
    // Get all changelog entries that are published but don't have approval status
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .or('approval_status.is.null,approval_status.eq.""');
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`📊 Found ${entries.length} entries needing approval status\n`);
    
    if (entries.length === 0) {
      console.log('✅ All entries already have approval status set');
      return;
    }
    
    // Update entries to set approval status
    let updatedCount = 0;
    let approvedCount = 0;
    
    for (const entry of entries) {
      const shouldApprove = (
        entry.status === 'published' && 
        entry.quality_score >= 0.7 && 
        entry.content_title && 
        entry.generated_content &&
        !entry.content_title.toLowerCase().includes('test') &&
        !entry.content_title.toLowerCase().includes('internal')
      );
      
      const newStatus = shouldApprove ? 'approved' : 'pending';
      const updates = {
        approval_status: newStatus
      };
      
      // If we're approving it, also set some other helpful fields
      if (shouldApprove) {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = 'admin_migration';
        
        // Set category based on title/content analysis
        if (!entry.update_category) {
          let category = 'improved';
          const title = entry.content_title.toLowerCase();
          if (title.includes('new') || title.includes('added') || title.includes('introducing')) {
            category = 'added';
          } else if (title.includes('fix') || title.includes('bug') || title.includes('issue')) {
            category = 'fixed';
          } else if (title.includes('security') || title.includes('authentication')) {
            category = 'security';
          }
          updates.update_category = category;
        }
        
        // Set version if not present
        if (!entry.version) {
          const date = new Date(entry.created_at);
          updates.version = `v2024.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate()}`;
        }
        
        approvedCount++;
      }
      
      const { error: updateError } = await supabase
        .from('generated_content')
        .update(updates)
        .eq('id', entry.id);
      
      if (updateError) {
        console.error(`❌ Failed to update entry ${entry.id}:`, updateError);
      } else {
        console.log(`✅ Updated "${entry.content_title}" → ${newStatus}`);
        updatedCount++;
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`   Updated: ${updatedCount}/${entries.length}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   Pending: ${updatedCount - approvedCount}`);
    
    if (approvedCount > 0) {
      console.log(`\n🚀 Next steps:`);
      console.log(`   1. Review approved entries at: /approval`);
      console.log(`   2. Make entries public using the script: node make-entries-public.js`);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

console.log('Approval Status Fixer');
console.log('====================\n');

fixApprovalStatus();