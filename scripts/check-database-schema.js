#!/usr/bin/env node
/**
 * Check Database Schema Script
 * Inspects the existing database structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n');
  
  try {
    // Check what tables exist by trying to query them
    const tablesToCheck = ['customers', 'hubspot_contacts', 'hubspot_deals', 'meetings', 'insights'];
    const existingTables = [];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(tableName);
        }
      } catch (err) {
        // Table doesn't exist
      }
    }
    
    console.log('📊 Existing Tables:');
    existingTables.forEach(table => {
      console.log(`  - ${table}`);
    });
    
    if (existingTables.length === 0) {
      console.log('  ❌ No tables found. You may need to run the database setup first.');
      return;
    }
    
    // For each existing table, try to understand its structure by querying it
    for (const tableName of existingTables) {
      console.log(`\n🔍 Checking ${tableName} structure...`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ Error querying ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ Table ${tableName} exists and is queryable`);
          if (data && data.length > 0) {
            console.log(`    Sample columns: ${Object.keys(data[0]).join(', ')}`);
          } else {
            console.log(`    Table is empty`);
          }
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

if (require.main === module) {
  checkSchema();
}

module.exports = { checkSchema };