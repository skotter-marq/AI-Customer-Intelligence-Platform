#!/usr/bin/env node
/**
 * Setup Product Updates Schema
 * Sets up the product_updates table and related tables for JIRA integration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

function main() {
  console.log('🚀 AI Customer Intelligence Platform - Product Updates Schema Setup\n');
  
  const schemaPath = path.join(__dirname, '..', 'database', '02_product_updates_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📋 Product Updates Schema Setup Instructions:');
  console.log('================================\n');
  
  console.log('1. Open your Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/yipbkonxdnlpvororuau/sql/new\n');
  
  console.log('2. Copy and paste the SQL from this file:');
  console.log(`   ${schemaPath}\n`);
  
  console.log('3. Click "Run" to execute the SQL\n');
  
  console.log('4. Verify the setup by running:');
  console.log('   npm run test:jira\n');
  
  console.log('📄 SQL File Content:');
  console.log('====================\n');
  console.log(sqlContent);
  
  console.log('\n✅ Copy the SQL above and paste it into your Supabase SQL Editor.');
  console.log('   Then run "npm run test:jira" to verify the setup.');
}

if (require.main === module) {
  main();
}

module.exports = { main };