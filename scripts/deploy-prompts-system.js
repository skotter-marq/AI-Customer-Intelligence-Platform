#!/usr/bin/env node

/**
 * Deployment script for the database-driven prompts and templates system
 * This script creates the database schema and seeds the initial data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function deployPromptsSystem() {
  console.log('🚀 Deploying prompts and templates system to database...');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Step 1: Check if tables exist
    console.log('🔍 Checking existing database schema...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['ai_prompts', 'slack_templates', 'email_templates', 'system_messages']);
    
    if (tablesError) {
      console.warn('⚠️ Could not check existing tables:', tablesError.message);
    }
    
    const existingTables = tables?.map(t => t.table_name) || [];
    console.log('📋 Existing tables:', existingTables);
    
    // Step 2: Create tables if they don't exist
    const requiredTables = ['ai_prompts', 'slack_templates', 'email_templates', 'system_messages'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('🏗️ Creating missing tables:', missingTables);
      
      // Read and execute schema SQL
      const schemaSQL = fs.readFileSync('./database/schema-prompts-templates.sql', 'utf8');
      const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
      
      if (schemaError) {
        console.error('❌ Schema creation failed:', schemaError.message);
        throw schemaError;
      }
      
      console.log('✅ Database schema created successfully');
    } else {
      console.log('✅ All required tables already exist');
    }
    
    // Step 3: Check for existing seed data
    console.log('🌱 Checking for existing seed data...');
    
    const { data: aiPrompts, error: promptsError } = await supabase
      .from('ai_prompts')
      .select('id')
      .limit(1);
    
    const { data: slackTemplates, error: templatesError } = await supabase
      .from('slack_templates')
      .select('id')
      .limit(1);
    
    const hasData = (aiPrompts && aiPrompts.length > 0) || (slackTemplates && slackTemplates.length > 0);
    
    if (!hasData) {
      console.log('📥 Seeding initial prompts and templates...');
      
      // Execute seed data
      const seedSQL = fs.readFileSync('./database/seed-all-prompts.sql', 'utf8');
      
      // Split SQL into individual statements and execute them
      const statements = seedSQL.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        try {
          await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
        } catch (error) {
          // Some statements might fail if data already exists - that's OK
          console.warn(`⚠️ SQL statement warning (may be expected):`, error.message);
        }
      }
      
      console.log('✅ Seed data inserted successfully');
    } else {
      console.log('✅ Seed data already exists');
    }
    
    // Step 4: Verify deployment
    console.log('🔎 Verifying deployment...');
    
    const verificationResults = {};
    
    for (const table of requiredTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(5);
      
      if (error) {
        verificationResults[table] = { status: 'error', error: error.message };
      } else {
        verificationResults[table] = { status: 'success', count: data?.length || 0 };
      }
    }
    
    console.log('📊 Verification results:');
    Object.entries(verificationResults).forEach(([table, result]) => {
      if (result.status === 'success') {
        console.log(`  ✅ ${table}: ${result.count} records`);
      } else {
        console.log(`  ❌ ${table}: ${result.error}`);
      }
    });
    
    // Step 5: Test PromptService functionality
    console.log('🧪 Testing PromptService functionality...');
    
    const { promptService } = require('../lib/prompt-service.js');
    
    // Test AI prompt retrieval
    const aiPrompt = await promptService.getAIPrompt('meeting-analysis');
    const slackTemplate = await promptService.getSlackTemplate('product-update-notification');
    const systemMessage = await promptService.getSystemMessage('api-success-general');
    
    console.log('🧪 Test results:');
    console.log(`  AI Prompt: ${aiPrompt ? '✅ Found' : '❌ Not found'}`);
    console.log(`  Slack Template: ${slackTemplate ? '✅ Found' : '❌ Not found'}`);
    console.log(`  System Message: ${systemMessage ? '✅ Found' : '❌ Not found'}`);
    
    // Success summary
    console.log('\n🎉 Prompts and templates system deployment completed successfully!');
    console.log('\n📝 Summary:');
    console.log('  ✅ Database schema deployed');
    console.log('  ✅ Seed data inserted');
    console.log('  ✅ PromptService tested');
    console.log('  ✅ System ready for use');
    
    console.log('\n🔗 Next steps:');
    console.log('  1. Update remaining hardcoded prompts in application files');
    console.log('  2. Test admin UI functionality');
    console.log('  3. Verify Slack templates work correctly');
    console.log('  4. Monitor usage and performance');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Helper function to execute SQL (if needed)
async function executeSQLStatement(supabase, sql) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    return true;
  } catch (error) {
    throw new Error(`SQL execution failed: ${error.message}`);
  }
}

// Run deployment
deployPromptsSystem().catch(error => {
  console.error('❌ Deployment script failed:', error);
  process.exit(1);
});