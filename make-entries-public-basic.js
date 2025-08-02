#!/usr/bin/env node

/**
 * Make qualified changelog entries public using only existing columns
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function makeEntriesPublicBasic() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🌐 Making qualified changelog entries public (basic mode)...\n');
    
    // Get published entries that have been approved and are not yet public
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .eq('status', 'published')
      .not('approved_by', 'is', null)
      .or('is_public.is.false,is_public.is.null,public_changelog_visible.is.false,public_changelog_visible.is.null');
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`📊 Found ${entries.length} qualified entries to make public\n`);
    
    if (entries.length === 0) {
      console.log('ℹ️  No qualified entries found. Checking current public entries...');
      
      // Show current public entries
      const { data: publicEntries } = await supabase
        .from('generated_content')
        .select('content_title, version, release_date, created_at')
        .eq('content_type', 'changelog_entry')
        .eq('status', 'published')
        .eq('is_public', true)
        .eq('public_changelog_visible', true)
        .not('release_date', 'is', null)
        .order('release_date', { ascending: false });
        
      if (publicEntries && publicEntries.length > 0) {
        console.log(`\n🌟 Currently public entries (${publicEntries.length}):`);
        publicEntries.forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.content_title}`);
          console.log(`   Version: ${entry.version || 'Not set'}`);
          console.log(`   Release: ${entry.release_date ? entry.release_date.split('T')[0] : 'Not set'}`);
          console.log('');
        });
      } else {
        console.log('❌ No public entries found. Run: node add-missing-fields.js first');
      }
      return;
    }
    
    // Update entries to make them public (using only existing columns)
    let updatedCount = 0;
    
    for (const entry of entries) {
      // Generate release date if not set (use creation date)
      const releaseDate = entry.release_date || entry.created_at;
      
      // Generate version if not set
      const version = entry.version || (() => {
        const date = new Date(releaseDate);
        return `v${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate()}`;
      })();
      
      // Only update fields that we know exist
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
        console.log(`   Quality: ${(entry.quality_score * 100).toFixed(0)}%`);
        console.log('');
        updatedCount++;
      }
    }
    
    console.log(`📊 Made ${updatedCount}/${entries.length} entries public\n`);
    
    if (updatedCount > 0) {
      console.log(`🎉 Success! Public changelog now has ${updatedCount} new entries`);
      console.log(`\n🔗 Test your public changelog:`);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      console.log(`   API: ${baseUrl}/api/public-changelog`);
      console.log(`   Recent: ${baseUrl}/api/public-changelog?timeframe=30d`);
      console.log(`   RSS: ${baseUrl}/api/public-changelog?format=rss`);
      
      // Test the API to confirm it works
      console.log(`\n🔍 Testing the API...`);
      try {
        const response = await fetch(`${baseUrl}/api/public-changelog`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ API test successful! Found ${data.changelog?.length || 0} public entries`);
          if (data.metadata?.usingFallbackData) {
            console.log(`⚠️  Note: API is using fallback mock data, not database data`);
            console.log(`   This suggests the database query didn't return results as expected`);
          } else {
            console.log(`✅ API is using real database data!`);
            if (data.changelog && data.changelog.length > 0) {
              console.log(`\n📋 Sample entries from API:`);
              data.changelog.slice(0, 3).forEach((entry, index) => {
                console.log(`${index + 1}. ${entry.customer_facing_title}`);
                console.log(`   Version: ${entry.version}`);
                console.log(`   Category: ${entry.category}`);
                console.log('');
              });
            }
          }
        } else {
          console.log(`❌ API test failed: ${response.status}`);
        }
      } catch (err) {
        console.log(`⚠️  Could not test API: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to make entries public:', error.message);
  }
}

console.log('Basic Public Changelog Entry Maker');
console.log('==================================\n');

makeEntriesPublicBasic();