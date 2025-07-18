#!/usr/bin/env node
/**
 * Setup Marketing Content Schema
 * Sets up the marketing content pipeline tables and templates
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

function main() {
  console.log('🚀 AI Customer Intelligence Platform - Marketing Content Schema Setup\n');
  
  const schemaPath = path.join(__dirname, '..', 'database', '04_marketing_content_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📋 Marketing Content Schema Setup Instructions:');
  console.log('================================\n');
  
  console.log('1. Open your Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/yipbkonxdnlpvororuau/sql/new\n');
  
  console.log('2. Copy and paste the SQL from this file:');
  console.log(`   ${schemaPath}\n`);
  
  console.log('3. Click "Run" to execute the SQL\n');
  
  console.log('4. Verify the setup by running:');
  console.log('   npm run test:marketing-content\n');
  
  console.log('📊 Schema Features:');
  console.log('==================\n');
  console.log('✅ Content template system with 18 template types');
  console.log('✅ AI-powered content generation with variable substitution');
  console.log('✅ Multi-stage approval workflow system');
  console.log('✅ Performance metrics tracking and analytics');
  console.log('✅ Campaign management and content organization');
  console.log('✅ Multi-channel distribution and publishing');
  console.log('✅ Content personalization and A/B testing');
  console.log('✅ Real-time content pipeline monitoring');
  console.log('✅ Integration with customer insights and competitive intelligence');
  console.log('✅ Sample templates for immediate use\n');
  
  console.log('📄 SQL File Content:');
  console.log('====================\n');
  console.log(sqlContent);
  
  console.log('\n✅ Copy the SQL above and paste it into your Supabase SQL Editor.');
  console.log('   Then run "npm run test:marketing-content" to verify the setup.');
}

if (require.main === module) {
  main();
}

module.exports = { main };