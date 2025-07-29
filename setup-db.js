#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSchema(schemaPath) {
  try {
    console.log(`📝 Reading schema: ${schemaPath}`);
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      try {
        console.log(`Executing statement ${i + 1}: ${statement.substring(0, 100)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} failed: ${error.message}`);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} execution error: ${err.message}`);
      }
    }
    
    console.log(`✅ Schema execution completed: ${path.basename(schemaPath)}`);
    
  } catch (error) {
    console.error(`❌ Error executing schema ${schemaPath}:`, error.message);
    throw error;
  }
}

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return false;
    }
    
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up database schema...\n');
  
  const schemaFiles = [
    'database/competitors_schema.sql',
    'database/workflows_schema.sql', 
    'database/agents_schema.sql'
  ];
  
  for (const schemaFile of schemaFiles) {
    const schemaPath = path.join(__dirname, schemaFile);
    
    if (!fs.existsSync(schemaPath)) {
      console.warn(`⚠️  Schema file not found: ${schemaFile}`);
      continue;
    }
    
    try {
      await executeSchema(schemaPath);
    } catch (error) {
      console.error(`❌ Failed to execute ${schemaFile}:`, error.message);
    }
  }
  
  console.log('\n🔍 Checking table creation...');
  
  const tables = [
    'competitors',
    'competitor_monitoring_sources', 
    'competitive_insights',
    'workflows',
    'workflow_executions',
    'agents',
    'agent_conversations'
  ];
  
  for (const table of tables) {
    const exists = await checkTable(table);
    console.log(`${exists ? '✅' : '❌'} Table: ${table}`);
  }
  
  console.log('\n🎉 Database setup completed!');
}

main().catch(console.error);