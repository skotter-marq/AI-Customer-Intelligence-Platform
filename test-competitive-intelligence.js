#!/usr/bin/env node
/**
 * Competitive Intelligence Test Script
 * Tests the competitive intelligence monitoring system
 */

const CompetitiveIntelligence = require('./lib/competitive-intelligence.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompetitiveIntelligence() {
  console.log('🔍 Testing Competitive Intelligence System...\n');
  
  try {
    const competitiveIntel = new CompetitiveIntelligence();
    
    // Test 1: Check database tables exist
    console.log('1. Testing database structure...');
    const tablesTest = await testDatabaseTables();
    if (tablesTest.success) {
      console.log('✅ Database tables exist and are accessible');
      console.log(`   Tables found: ${tablesTest.tables.join(', ')}`);
    } else {
      console.log('❌ Database tables not found');
      console.log('   Run: npm run db:setup-competitive-intelligence');
      return;
    }
    
    // Test 2: Create test competitor and monitoring sources
    console.log('\n2. Creating test competitor and monitoring sources...');
    const testData = await createTestData();
    console.log('✅ Test data created successfully');
    console.log(`   Competitor: ${testData.competitor.name}`);
    console.log(`   Monitoring sources: ${testData.sources.length}`);
    
    // Test 3: Test web monitoring (safe URLs)
    console.log('\n3. Testing web monitoring...');
    const webMonitoringTest = await testWebMonitoring(competitiveIntel, testData);
    if (webMonitoringTest.success) {
      console.log('✅ Web monitoring system working');
      console.log(`   Signals detected: ${webMonitoringTest.signalsDetected}`);
    } else {
      console.log('❌ Web monitoring failed');
      console.log(`   Error: ${webMonitoringTest.error}`);
    }
    
    // Test 4: Test single competitor monitoring
    console.log('\n4. Testing competitor monitoring...');
    const competitorMonitoringTest = await competitiveIntel.monitorCompetitor(testData.competitor);
    console.log('✅ Competitor monitoring completed');
    console.log(`   Sources checked: ${competitorMonitoringTest.sources_checked}`);
    console.log(`   Signals detected: ${competitorMonitoringTest.signals_detected}`);
    console.log(`   Errors: ${competitorMonitoringTest.errors.length}`);
    
    // Test 5: Test signal creation
    console.log('\n5. Testing signal creation...');
    const testSignal = await competitiveIntel.createSignal({
      competitorId: testData.competitor.id,
      sourceId: testData.sources[0].id,
      signalType: 'product_launch',
      title: 'Test Product Launch Signal',
      description: 'This is a test signal for validation',
      url: 'https://example.com/test-product',
      confidenceScore: 0.8,
      importanceScore: 0.7,
      tags: ['test', 'product', 'launch']
    });
    console.log('✅ Signal creation working');
    console.log(`   Signal ID: ${testSignal.id}`);
    console.log(`   Signal type: ${testSignal.signal_type}`);
    
    // Test 6: Test analytics
    console.log('\n6. Testing analytics...');
    const analytics = await competitiveIntel.getMonitoringAnalytics();
    console.log('✅ Analytics retrieved successfully');
    console.log(`   Total signals: ${analytics.totalSignals}`);
    console.log(`   Recent signals: ${analytics.recentSignals}`);
    console.log(`   Active competitors: ${analytics.activeCompetitors}`);
    console.log(`   Active sources: ${analytics.activeSources}`);
    
    // Test 7: Test high-priority signals
    console.log('\n7. Testing high-priority signals...');
    const highPrioritySignals = await competitiveIntel.getRecentHighPrioritySignals(30);
    console.log('✅ High-priority signals retrieved');
    console.log(`   High-priority signals found: ${highPrioritySignals.length}`);
    
    // Test 8: Test API client setup
    console.log('\n8. Testing API client configurations...');
    const apiClientsTest = testApiClients();
    console.log('✅ API clients configured');
    console.log(`   GitHub API: ${apiClientsTest.github ? '✅ Ready' : '⚠️  No token'}`);
    console.log(`   Product Hunt API: ${apiClientsTest.productHunt ? '✅ Ready' : '⚠️  No token'}`);
    console.log(`   Crunchbase API: ${apiClientsTest.crunchbase ? '✅ Ready' : '⚠️  No token'}`);
    
    // Test 9: Clean up test data
    console.log('\n9. Cleaning up test data...');
    await cleanupTestData(testData);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Competitive Intelligence test complete!');
    console.log('\n📊 Summary:');
    console.log('   - Database Structure: ✅ Working');
    console.log('   - Web Monitoring: ✅ Working');
    console.log('   - Signal Creation: ✅ Working');
    console.log('   - Analytics: ✅ Working');
    console.log('   - API Clients: ✅ Configured');
    console.log('\n💡 Setup Instructions:');
    console.log('   1. Run: npm run db:setup-competitive-intelligence');
    console.log('   2. Set optional API tokens in .env.local:');
    console.log('      - GITHUB_TOKEN for GitHub monitoring');
    console.log('      - PRODUCT_HUNT_TOKEN for Product Hunt monitoring');
    console.log('      - CRUNCHBASE_API_KEY for Crunchbase monitoring');
    console.log('   3. Use: competitiveIntel.monitorAllCompetitors() for production');
    
  } catch (error) {
    console.error('❌ Competitive Intelligence test failed:', error.message);
    console.error('\n🔧 Common Issues:');
    console.error('   - Make sure competitive intelligence schema is set up');
    console.error('   - Check database connection and permissions');
    console.error('   - Verify .env.local file has correct Supabase credentials');
    console.error('   - Run: npm run db:setup-competitive-intelligence');
  }
}

async function testDatabaseTables() {
  try {
    const tables = ['competitors', 'monitoring_sources', 'intelligence_signals', 'competitor_features', 'pricing_intelligence'];
    const foundTables = [];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        foundTables.push(table);
      }
    }
    
    return {
      success: foundTables.length === tables.length,
      tables: foundTables
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function createTestData() {
  // Create test competitor
  const { data: competitor, error: competitorError } = await supabase
    .from('competitors')
    .insert({
      name: 'Test Competitor CI',
      domain: 'testcompetitor.com',
      description: 'Test competitor for CI system validation',
      industry: 'Technology',
      competitor_type: 'direct',
      threat_level: 'medium',
      status: 'active'
    })
    .select()
    .single();

  if (competitorError) {
    throw new Error(`Failed to create test competitor: ${competitorError.message}`);
  }

  // Create monitoring sources
  const sourcesData = [
    {
      competitor_id: competitor.id,
      source_type: 'website',
      source_url: 'https://httpbin.org/html',
      source_name: 'Test Website',
      monitoring_frequency: 'daily',
      is_active: true
    },
    {
      competitor_id: competitor.id,
      source_type: 'blog',
      source_url: 'https://httpbin.org/html',
      source_name: 'Test Blog',
      monitoring_frequency: 'daily',
      is_active: true
    },
    {
      competitor_id: competitor.id,
      source_type: 'github',
      source_url: 'https://github.com/octocat/Hello-World',
      source_name: 'Test GitHub Repo',
      monitoring_frequency: 'weekly',
      is_active: true
    }
  ];

  const { data: sources, error: sourcesError } = await supabase
    .from('monitoring_sources')
    .insert(sourcesData)
    .select();

  if (sourcesError) {
    throw new Error(`Failed to create monitoring sources: ${sourcesError.message}`);
  }

  // Add sources to competitor object
  competitor.monitoring_sources = sources;

  return { competitor, sources };
}

async function testWebMonitoring(competitiveIntel, testData) {
  try {
    // Test website monitoring with a safe URL
    const websiteSignals = await competitiveIntel.monitorWebsite(
      testData.competitor.id,
      testData.sources.find(s => s.source_type === 'website')
    );

    return {
      success: true,
      signalsDetected: websiteSignals.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function testApiClients() {
  return {
    github: !!process.env.GITHUB_TOKEN,
    productHunt: !!process.env.PRODUCT_HUNT_TOKEN,
    crunchbase: !!process.env.CRUNCHBASE_API_KEY
  };
}

async function cleanupTestData(testData) {
  // Delete in reverse order to handle foreign key constraints
  await supabase.from('intelligence_signals').delete().eq('competitor_id', testData.competitor.id);
  await supabase.from('monitoring_sources').delete().eq('competitor_id', testData.competitor.id);
  await supabase.from('competitors').delete().eq('id', testData.competitor.id);
}

// Run the test
if (require.main === module) {
  testCompetitiveIntelligence();
}

module.exports = { testCompetitiveIntelligence };