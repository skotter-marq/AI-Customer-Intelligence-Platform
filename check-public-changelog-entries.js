#!/usr/bin/env node

/**
 * Check existing changelog entries and their public visibility status
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkPublicChangelogEntries() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔍 Checking changelog entries for public visibility...\n');
    
    // Get all changelog entries with detailed information
    const { data: allEntries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`📊 Found ${allEntries.length} total changelog entries\n`);
    
    // Analyze entries by status
    const statusCounts = {
      total: allEntries.length,
      approved: 0,
      pending: 0,
      rejected: 0,
      changes_requested: 0,
      public: 0,
      public_visible: 0,
      ready_for_public: 0
    };
    
    // Check for entries that meet public changelog criteria
    const publicReadyEntries = [];
    const publicVisibleEntries = [];
    
    allEntries.forEach((entry, index) => {
      // Count statuses
      if (entry.approval_status === 'approved') statusCounts.approved++;
      if (entry.approval_status === 'pending') statusCounts.pending++;
      if (entry.approval_status === 'rejected') statusCounts.rejected++;
      if (entry.approval_status === 'changes_requested') statusCounts.changes_requested++;
      if (entry.is_public) statusCounts.public++;
      if (entry.public_changelog_visible) statusCounts.public_visible++;
      
      // Check if entry meets all public changelog criteria
      const isFullyPublic = (
        entry.content_type === 'changelog_entry' &&
        entry.approval_status === 'approved' &&
        entry.is_public === true &&
        entry.public_changelog_visible === true &&
        entry.release_date !== null
      );
      
      // Check if entry is ready to be made public (approved but not public yet)
      const isReadyForPublic = (
        entry.content_type === 'changelog_entry' &&
        entry.approval_status === 'approved' &&
        (entry.is_public !== true || entry.public_changelog_visible !== true)
      );
      
      if (isFullyPublic) {
        publicVisibleEntries.push(entry);
      }
      
      if (isReadyForPublic) {
        publicReadyEntries.push(entry);
        statusCounts.ready_for_public++;
      }
      
      console.log(`${index + 1}. ${entry.content_title}`);
      console.log(`   📅 Created: ${entry.created_at}`);
      console.log(`   📋 Status: ${entry.status}`);
      console.log(`   ✅ Approval: ${entry.approval_status}`);
      console.log(`   🌐 Is Public: ${entry.is_public || false}`);
      console.log(`   👁️  Public Visible: ${entry.public_changelog_visible || false}`);
      console.log(`   📆 Release Date: ${entry.release_date || 'Not set'}`);
      console.log(`   📊 Quality Score: ${entry.quality_score}`);
      
      if (entry.metadata && typeof entry.metadata === 'object') {
        const jiraKey = entry.metadata.jira_story_key;
        if (jiraKey) {
          console.log(`   🎫 JIRA: ${jiraKey}`);
        }
      }
      
      if (isFullyPublic) {
        console.log(`   ✨ STATUS: PUBLICLY VISIBLE IN CHANGELOG`);
      } else if (isReadyForPublic) {
        console.log(`   🚀 STATUS: READY TO MAKE PUBLIC`);
      } else if (entry.approval_status === 'approved') {
        console.log(`   ⏳ STATUS: APPROVED BUT NEEDS PUBLIC SETTINGS`);
      } else {
        console.log(`   ⏸️  STATUS: NOT READY FOR PUBLIC (${entry.approval_status})`);
      }
      
      console.log(''); // Empty line for readability
    });
    
    // Summary statistics
    console.log('📊 SUMMARY STATISTICS');
    console.log('====================');
    console.log(`Total Entries: ${statusCounts.total}`);
    console.log(`Approved: ${statusCounts.approved}`);
    console.log(`Pending: ${statusCounts.pending}`);
    console.log(`Rejected: ${statusCounts.rejected}`);
    console.log(`Changes Requested: ${statusCounts.changes_requested}`);
    console.log(`Marked as Public: ${statusCounts.public}`);
    console.log(`Public Visible: ${statusCounts.public_visible}`);
    console.log(`Ready for Public: ${statusCounts.ready_for_public}`);
    console.log('');
    
    // Show entries that are currently visible in public changelog
    if (publicVisibleEntries.length > 0) {
      console.log('🌟 ENTRIES CURRENTLY VISIBLE IN PUBLIC CHANGELOG:');
      console.log('================================================');
      publicVisibleEntries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.content_title}`);
        console.log(`   Release Date: ${entry.release_date}`);
        console.log(`   Category: ${entry.update_category || 'Not set'}`);
        console.log(`   Quality: ${(entry.quality_score * 100).toFixed(0)}%`);
        console.log('');
      });
    } else {
      console.log('❌ NO ENTRIES ARE CURRENTLY VISIBLE IN PUBLIC CHANGELOG');
      console.log('');
    }
    
    // Show entries that can be made public
    if (publicReadyEntries.length > 0) {
      console.log('🚀 ENTRIES READY TO BE MADE PUBLIC:');
      console.log('===================================');
      publicReadyEntries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.content_title}`);
        console.log(`   ID: ${entry.id}`);
        console.log(`   Missing: is_public=${entry.is_public}, public_changelog_visible=${entry.public_changelog_visible}, release_date=${entry.release_date}`);
        console.log('');
      });
      
      console.log('💡 TO MAKE THESE PUBLIC, UPDATE WITH:');
      console.log(`UPDATE generated_content SET`);
      console.log(`  is_public = true,`);
      console.log(`  public_changelog_visible = true,`);
      console.log(`  release_date = NOW()`);
      console.log(`WHERE approval_status = 'approved' AND content_type = 'changelog_entry';`);
      console.log('');
    }
    
    // Test the public API
    console.log('🔗 TESTING PUBLIC CHANGELOG API:');
    console.log('================================');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/public-changelog`;
      console.log(`API URL: ${apiUrl}`);
      console.log('(Test this URL in your browser to see the public changelog)');
    } catch (err) {
      console.log('Could not determine API URL - check NEXT_PUBLIC_BASE_URL environment variable');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

console.log('Public Changelog Entry Checker');
console.log('==============================\n');

checkPublicChangelogEntries();