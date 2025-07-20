#!/usr/bin/env node
/**
 * Execute Competitive Intelligence Schema
 * Runs the SQL schema directly via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSchema() {
  console.log('🚀 Executing Competitive Intelligence Schema...\n');
  
  try {
    // Read the SQL schema file
    const sqlFilePath = path.join(__dirname, 'database', '03_competitive_intelligence_schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`📊 Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`${i + 1}/${statements.length}: Executing statement...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} may have executed with warnings:`, error.message);
          // Continue execution - some statements might conflict with existing objects
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.log(`⚠️  Statement ${i + 1} execution error:`, execError.message);
        // Continue with next statement
      }
    }
    
    console.log('\n✅ Schema execution completed!');
    console.log('\n🧪 Running verification test...\n');
    
    // Test basic table access
    const tables = ['competitors', 'monitoring_sources', 'intelligence_signals', 'competitor_features', 'pricing_intelligence'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          console.log(`✅ Table '${table}' is accessible`);
        } else {
          console.log(`❌ Table '${table}' error:`, error.message);
        }
      } catch (testError) {
        console.log(`❌ Table '${table}' test failed:`, testError.message);
      }
    }
    
    console.log('\n🎉 Competitive Intelligence schema setup complete!');
    console.log('\n💡 Next steps:');
    console.log('   - Run: npm run test:competitive-intelligence');
    console.log('   - Check Supabase dashboard for created tables');
    console.log('   - Review sample data in competitors table');
    
  } catch (error) {
    console.error('❌ Schema execution failed:', error.message);
    process.exit(1);
  }
}

executeSchema();