require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  try {
    // Check if product_updates table exists
    const { data, error } = await supabase
      .from('product_updates')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ product_updates table does not exist');
        console.log('📝 Creating product_updates table...');
        
        // Create the table
        const { error: createError } = await supabase.rpc('create_product_updates_table');
        
        if (createError) {
          console.log('❌ Failed to create table:', createError.message);
          console.log('\n📋 Manual SQL to create table:');
          console.log(`
CREATE TABLE product_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jira_issue_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending_review',
  reporter TEXT,
  assignee TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_jira_data JSONB
);

CREATE INDEX idx_product_updates_status ON product_updates(status);
CREATE INDEX idx_product_updates_created_at ON product_updates(created_at DESC);
          `);
        } else {
          console.log('✅ product_updates table created successfully');
        }
      } else {
        console.log('❌ Database error:', error.message);
      }
    } else {
      console.log('✅ product_updates table exists');
      console.log(`   Found ${data.length} records`);
    }

    // Check other tables
    const tables = ['customers', 'meetings', 'hubspot_contacts', 'insights'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${table} table: ${error.message}`);
        } else {
          console.log(`✅ ${table} table exists`);
        }
      } catch (err) {
        console.log(`❌ ${table} table: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkTables();