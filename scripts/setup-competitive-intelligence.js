#!/usr/bin/env node
/**
 * Setup Competitive Intelligence Schema
 * Sets up the competitive intelligence tables and monitoring system
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

function main() {
  console.log('🚀 AI Customer Intelligence Platform - Competitive Intelligence Schema Setup\n');
  
  const schemaPath = path.join(__dirname, '..', 'database', '03_competitive_intelligence_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📋 Competitive Intelligence Schema Setup Instructions:');
  console.log('================================\n');
  
  console.log('1. Open your Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/yipbkonxdnlpvororuau/sql/new\n');
  
  console.log('2. Copy and paste the SQL from this file:');
  console.log(`   ${schemaPath}\n`);
  
  console.log('3. Click "Run" to execute the SQL\n');
  
  console.log('4. Verify the setup by running:');
  console.log('   npm run test:competitive-intelligence\n');
  
  console.log('📊 Schema Features:');
  console.log('==================\n');
  console.log('✅ Competitor tracking and profiling');
  console.log('✅ Multi-channel monitoring (web, social, APIs)');
  console.log('✅ Intelligence signal detection and analysis');
  console.log('✅ Feature gap analysis and competitive benchmarking');
  console.log('✅ Pricing intelligence and change tracking');
  console.log('✅ Automated alerts and notification system');
  console.log('✅ Intelligence reports and analytics views');
  console.log('✅ Sample data for testing and validation\n');
  
  console.log('📄 SQL File Content:');
  console.log('====================\n');
  console.log(sqlContent);
  
  console.log('\n✅ Copy the SQL above and paste it into your Supabase SQL Editor.');
  console.log('   Then run "npm run test:competitive-intelligence" to verify the setup.');
}

if (require.main === module) {
  main();
}

module.exports = { main };