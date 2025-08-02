#!/usr/bin/env node

/**
 * Final check for public changelog entries using the exact criteria from the API
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkPublicEntriesFinal() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔍 Checking entries with EXACT public changelog API criteria...\n');
    
    // Use the exact same query as the public-changelog API
    const { data: publicEntries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .eq('is_public', true)
      .eq('public_changelog_visible', true)
      .not('release_date', 'is', null)
      .order('release_date', { ascending: false });
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`🎉 Found ${publicEntries.length} entries that meet public changelog criteria!\n`);
    
    if (publicEntries.length === 0) {
      console.log('❌ No entries meet the public changelog criteria yet');
      console.log('\n📋 Criteria required:');
      console.log('   ✓ content_type = "changelog_entry"');
      console.log('   ✓ is_public = true');
      console.log('   ✓ public_changelog_visible = true');
      console.log('   ✓ release_date is not null');
      return;
    }
    
    // Show each public entry
    publicEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.content_title}`);
      console.log(`   📅 Release Date: ${entry.release_date.split('T')[0]}`);
      console.log(`   📊 Quality: ${(entry.quality_score * 100).toFixed(0)}%`);
      console.log(`   🆔 ID: ${entry.id}`);
      console.log(`   📝 Content Preview: ${entry.generated_content.substring(0, 100)}...`);
      
      // Show what will be displayed in public API
      const version = entry.version || `v${new Date(entry.release_date).getFullYear()}.${(new Date(entry.release_date).getMonth() + 1).toString().padStart(2, '0')}.${Math.floor(Math.random() * 100)}`;
      console.log(`   🏷️  Version: ${version}`);
      
      // Determine category
      const title = entry.content_title.toLowerCase();
      let category = 'Improved';
      if (title.includes('new') || title.includes('added') || title.includes('introducing')) {
        category = 'Added';
      } else if (title.includes('fix') || title.includes('bug') || title.includes('issue')) {
        category = 'Fixed';
      } else if (title.includes('security') || title.includes('authentication')) {
        category = 'Security';
      }
      console.log(`   🏷️  Category: ${category}`);
      console.log('');
    });
    
    // Test the public API directly
    console.log('🌐 Testing Public Changelog API...');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`   API URL: ${baseUrl}/api/public-changelog`);
    
    // Create a summary for easy reference
    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Public entries in database: ${publicEntries.length}`);
    console.log(`   🌐 These will be visible in your public changelog`);
    console.log(`   📱 Test with: curl "${baseUrl}/api/public-changelog"`);
    console.log(`   📄 RSS feed: curl "${baseUrl}/api/public-changelog?format=rss"`);
    
    // Show sample API response format
    if (publicEntries.length > 0) {
      const sampleEntry = publicEntries[0];
      console.log(`\n🔍 Sample API Response Format:`);
      console.log(`{`);
      console.log(`  "customer_facing_title": "${sampleEntry.content_title}",`);
      console.log(`  "customer_facing_description": "${sampleEntry.generated_content.substring(0, 100)}...",`);
      console.log(`  "release_date": "${sampleEntry.release_date}",`);
      console.log(`  "version": "${sampleEntry.version || 'auto-generated'}",`);
      console.log(`  "category": "Improved" (auto-detected),`);
      console.log(`  "highlights": [] (empty for now),`);
      console.log(`  "breaking_changes": false`);
      console.log(`}`);
    }
    
    // Instructions for managing visibility
    console.log(`\n🔧 To manage public visibility:`);
    console.log(`   • Approve: Use /approval page (when approval_status is added)`);
    console.log(`   • Make public: Set is_public=true, public_changelog_visible=true`);
    console.log(`   • Hide: Set public_changelog_visible=false`);
    console.log(`   • Version: Update version field for better organization`);
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

console.log('Final Public Changelog Entry Check');
console.log('==================================\n');

checkPublicEntriesFinal();