#!/usr/bin/env node
/**
 * Database Setup Script
 * Sets up the complete database schema for the AI Customer Intelligence Platform
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SQL files to execute in order
const sqlFiles = [
  '01_customer_research_schema.sql',
  // Add more schema files as they're created
  // '02_competitive_intelligence_schema.sql',
  // '03_marketing_content_schema.sql',
  // '04_product_updates_schema.sql'
];

async function executeSqlFile(filePath) {
  try {
    console.log(`\n📄 Reading ${path.basename(filePath)}...`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📋 SQL file content loaded. Manual execution required.`);
    console.log(`   Please copy the SQL from ${filePath} and run it in your Supabase SQL Editor.`);
    console.log(`   Supabase URL: https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.replace('https://', '')}/sql/new`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up AI Customer Intelligence Platform Database...\n');
    
    // Check connection with a simple query
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    
    console.log('✅ Database connection successful');
    
    // Execute SQL files in order
    for (const sqlFile of sqlFiles) {
      const filePath = path.join(__dirname, '..', 'database', sqlFile);
      
      if (fs.existsSync(filePath)) {
        await executeSqlFile(filePath);
      } else {
        console.log(`⏭️  Skipping ${sqlFile} (file not found)`);
      }
    }
    
    // Test the setup by checking if tables exist
    console.log('\n🔍 Verifying database setup...');
    
    const tables = [
      'customers',
      'meetings', 
      'hubspot_contacts',
      'hubspot_deals',
      'hubspot_tickets',
      'insights',
      'follow_ups',
      'feature_requests',
      'customer_correlations'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.warn(`⚠️  Warning: Table '${table}' may not exist: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' verified`);
      }
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Next steps:');
    console.log('1. Run the application: npm run dev');
    console.log('2. Test the HubSpot integration: node test-hubspot-integration.js');
    console.log('3. Test the webhook endpoint: node test-webhook.js');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };