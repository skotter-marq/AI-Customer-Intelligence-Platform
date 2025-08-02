#!/usr/bin/env node

/**
 * Make approved changelog entries public and visible in the public changelog
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function makeEntriesPublic() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🌐 Making approved changelog entries public...\n');
    
    // Get approved entries that aren't public yet
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .eq('approval_status', 'approved')
      .or('is_public.is.false,is_public.is.null,public_changelog_visible.is.false,public_changelog_visible.is.null');
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`📊 Found ${entries.length} approved entries to make public\n`);
    
    if (entries.length === 0) {
      console.log('✅ All approved entries are already public');
      
      // Show current public entries
      const { data: publicEntries } = await supabase
        .from('generated_content')
        .select('content_title, version, release_date, created_at')
        .eq('content_type', 'changelog_entry')
        .eq('approval_status', 'approved')
        .eq('is_public', true)
        .eq('public_changelog_visible', true)
        .not('release_date', 'is', null)
        .order('release_date', { ascending: false });
        
      if (publicEntries && publicEntries.length > 0) {
        console.log(`\n🌟 Currently public entries (${publicEntries.length}):`);
        publicEntries.forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.content_title}`);
          console.log(`   Version: ${entry.version || 'Not set'}`);
          console.log(`   Release: ${entry.release_date || 'Not set'}`);
          console.log('');
        });
      }
      return;
    }
    
    // Update entries to make them public
    let updatedCount = 0;
    
    for (const entry of entries) {
      // Generate release date if not set (use creation date or now)
      const releaseDate = entry.release_date || entry.created_at || new Date().toISOString();
      
      // Generate version if not set
      const version = entry.version || (() => {
        const date = new Date(releaseDate);
        return `v${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate()}`;
      })();
      
      const updates = {
        is_public: true,
        public_changelog_visible: true,
        release_date: releaseDate,
        version: version
      };
      
      const { error: updateError } = await supabase
        .from('generated_content')
        .update(updates)
        .eq('id', entry.id);
      
      if (updateError) {
        console.error(`❌ Failed to make entry public ${entry.id}:`, updateError);
      } else {
        console.log(`✅ Made public: "${entry.content_title}"`);
        console.log(`   Version: ${version}`);
        console.log(`   Release Date: ${releaseDate.split('T')[0]}`);
        console.log('');
        updatedCount++;
      }
    }
    
    console.log(`📊 Made ${updatedCount}/${entries.length} entries public\n`);
    
    if (updatedCount > 0) {
      console.log(`🎉 Success! Public changelog now has ${updatedCount} new entries`);
      console.log(`\n🔗 View your public changelog at:`);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      console.log(`   API: ${baseUrl}/api/public-changelog`);
      console.log(`   Frontend: ${baseUrl}/public-changelog (if implemented)`);
      
      console.log(`\n📝 Test the API with different filters:`);
      console.log(`   All entries: ${baseUrl}/api/public-changelog`);
      console.log(`   Recent (30d): ${baseUrl}/api/public-changelog?timeframe=30d`);
      console.log(`   Added features: ${baseUrl}/api/public-changelog?category=added`);
      console.log(`   RSS feed: ${baseUrl}/api/public-changelog?format=rss`);
      console.log(`   Limited: ${baseUrl}/api/public-changelog?limit=5`);
    }
    
  } catch (error) {
    console.error('❌ Failed to make entries public:', error.message);
  }
}

console.log('Public Changelog Entry Maker');
console.log('============================\n');

makeEntriesPublic();