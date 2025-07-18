#!/usr/bin/env node
/**
 * Simple Database Setup Script
 * Provides instructions for setting up the database manually
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

function setupDatabase() {
  console.log('🚀 AI Customer Intelligence Platform - Database Setup\n');
  
  // Get Supabase project ID from URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectId = supabaseUrl?.split('.')[0]?.replace('https://', '');
  
  console.log('📋 Database Setup Instructions:');
  console.log('================================\n');
  
  console.log('1. Open your Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${projectId}/sql/new\n`);
  
  console.log('2. Copy and paste the SQL from this file:');
  console.log(`   ${path.join(__dirname, '..', 'database', '01_customer_research_schema.sql')}\n`);
  
  console.log('3. Click "Run" to execute the SQL\n');
  
  console.log('4. Verify the setup by running:');
  console.log('   npm run test:hubspot\n');
  
  // Show the SQL file content
  const sqlFile = path.join(__dirname, '..', 'database', '01_customer_research_schema.sql');
  
  if (fs.existsSync(sqlFile)) {
    console.log('📄 SQL File Content:');
    console.log('====================\n');
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log(sql);
    
    console.log('\n✅ Copy the SQL above and paste it into your Supabase SQL Editor.');
    console.log('   Then run "npm run test:hubspot" to verify the setup.');
  } else {
    console.error('❌ SQL file not found. Please make sure you have the database schema files.');
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };