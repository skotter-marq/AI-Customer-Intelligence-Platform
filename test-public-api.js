#!/usr/bin/env node

/**
 * Test the public changelog API locally
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testPublicAPI() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🧪 Testing Public Changelog API Logic...\n');
    
    // Simulate the exact query from the API
    let query = supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .eq('is_public', true)
      .eq('public_changelog_visible', true)
      .not('release_date', 'is', null)
      .order('release_date', { ascending: false });

    const { data: dbEntries, error } = await query.limit(50);
    
    if (error) {
      console.error('❌ Database query failed:', error);
      console.log('📋 This means the API will fall back to mock data');
      return;
    }
    
    console.log(`✅ Found ${dbEntries.length} entries matching public API criteria\n`);
    
    if (dbEntries.length === 0) {
      console.log('❌ No entries match the public changelog criteria');
      console.log('   The API will fall back to mock data');
      return;
    }
    
    // Transform data like the API does
    const publicEntries = dbEntries.map((entry) => {
      // Extract JIRA story key from metadata
      const metadata = typeof entry.metadata === 'string' ? JSON.parse(entry.metadata) : entry.metadata || {};
      const jiraStoryKey = metadata.jira_story_key || entry.jira_story_key;
      
      // Generate version if not provided
      const version = entry.version || `v${new Date(entry.release_date || entry.created_at).getFullYear()}.${(new Date(entry.release_date || entry.created_at).getMonth() + 1).toString().padStart(2, '0')}.${Math.floor(Math.random() * 100)}`;
      
      // Determine category from title
      const title = entry.content_title.toLowerCase();
      let category = 'Improved';
      if (title.includes('new') || title.includes('added') || title.includes('introducing')) {
        category = 'Added';
      } else if (title.includes('fix') || title.includes('bug') || title.includes('issue')) {
        category = 'Fixed';
      } else if (title.includes('security') || title.includes('authentication')) {
        category = 'Security';
      }
      
      return {
        id: entry.id,
        version: version,
        release_date: entry.release_date || entry.created_at,
        category: category,
        customer_facing_title: entry.content_title,
        customer_facing_description: entry.generated_content.substring(0, 500) + (entry.generated_content.length > 500 ? '...' : ''),
        highlights: Array.isArray(entry.tldr_bullet_points) ? entry.tldr_bullet_points : [],
        breaking_changes: entry.breaking_changes || false,
        migration_notes: entry.migration_notes,
        affected_users: entry.affected_users,
        view_count: Math.floor(Math.random() * 1000) + 100,
        upvotes: Math.floor(Math.random() * 50) + 10,
        feedback_count: Math.floor(Math.random() * 20) + 2,
        jira_story_key: jiraStoryKey
      };
    });
    
    console.log('🎉 Successfully transformed entries for public API:');
    console.log('================================================\n');
    
    publicEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.customer_facing_title}`);
      console.log(`   Version: ${entry.version}`);
      console.log(`   Category: ${entry.category}`);
      console.log(`   Released: ${entry.release_date.split('T')[0]}`);
      console.log(`   Description: ${entry.customer_facing_description.substring(0, 100)}...`);
      console.log(`   Highlights: ${entry.highlights.length} items`);
      console.log('');
    });
    
    // Simulate API response
    const apiResponse = {
      success: true,
      changelog: publicEntries,
      pagination: {
        limit: 20,
        offset: 0,
        total: publicEntries.length,
        hasMore: false
      },
      metadata: {
        categories: ['Added', 'Fixed', 'Improved', 'Deprecated', 'Security'],
        totalPublishedVersions: publicEntries.length,
        lastUpdated: new Date().toISOString(),
        apiVersion: '1.0',
        usingFallbackData: false
      }
    };
    
    console.log('📊 Sample API Response Structure:');
    console.log('=================================');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // Test URL generation
    console.log('\n🔗 Public API URLs:');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`   All entries: ${baseUrl}/api/public-changelog`);
    console.log(`   Recent (30d): ${baseUrl}/api/public-changelog?timeframe=30d`);
    console.log(`   Limited (5): ${baseUrl}/api/public-changelog?limit=5`);
    console.log(`   RSS feed: ${baseUrl}/api/public-changelog?format=rss`);
    
    console.log('\n✅ Public changelog API should now work with real database data!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('Public Changelog API Test');
console.log('=========================\n');

testPublicAPI();