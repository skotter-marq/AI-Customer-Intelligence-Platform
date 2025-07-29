#!/usr/bin/env node
/**
 * Content Pipeline Database Setup Script
 * Sets up all database tables needed for the content generation pipeline
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

async function setupContentPipelineDatabase() {
  try {
    console.log('🚀 Setting up Content Pipeline Database...\n');
    
    // Check connection with a simple test
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .rpc('version');
      
      if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }
    } catch (error) {
      // Try a different connection test
      const { data: tables, error: tablesError } = await supabase
        .from('customers')
        .select('id')
        .limit(1);
      
      if (tablesError && !tablesError.message.includes('does not exist')) {
        throw new Error(`Database connection failed: ${tablesError.message}`);
      }
    }
    
    console.log('✅ Database connection successful');
    
    // Read and display the SQL file content
    const sqlFilePath = path.join(__dirname, '..', 'database', 'content-pipeline-schema.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }
    
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('\n📄 Content Pipeline SQL Schema loaded');
    console.log('📋 Manual execution required:');
    console.log('   1. Copy the SQL from: database/content-pipeline-schema.sql');
    console.log('   2. Paste and execute in your Supabase SQL Editor');
    console.log(`   3. Supabase URL: https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.replace('https://', '')}/sql/new`);
    
    console.log('\n📊 Tables to be created:');
    const tables = [
      'content_templates - Reusable content templates',
      'generated_content - All generated content with metrics',
      'content_data_sources - Links content to source data',
      'content_campaign_assignments - Campaign content assignments',
      'content_approval_workflow - Content approval processes',
      'pipeline_execution_logs - Pipeline execution tracking',
      'content_analytics - Custom content analytics',
      'content_feedback - Content feedback collection',
      'content_versions - Content version history',
      'content_performance_metrics - Performance tracking'
    ];
    
    tables.forEach(table => console.log(`   ✓ ${table}`));
    
    console.log('\n🔍 After executing the SQL, run verification:');
    console.log('   node scripts/verify-content-pipeline.js');
    
    // Test if tables already exist
    console.log('\n🔍 Checking existing tables...');
    
    const contentTables = [
      'content_templates',
      'generated_content', 
      'content_data_sources',
      'content_approval_workflow',
      'pipeline_execution_logs'
    ];
    
    let existingTables = 0;
    for (const table of contentTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table '${table}' exists`);
          existingTables++;
        }
      } catch (error) {
        console.log(`⚠️  Table '${table}' not found`);
      }
    }
    
    if (existingTables === contentTables.length) {
      console.log('\n🎉 All content pipeline tables already exist!');
      console.log('✅ Content pipeline database is ready');
      
      // Test the content pipeline integration
      console.log('\n🧪 Testing content pipeline integration...');
      await testContentPipelineIntegration();
    } else {
      console.log(`\n📋 Found ${existingTables}/${contentTables.length} tables`);
      console.log('⚠️  Please execute the SQL schema to create missing tables');
    }
    
  } catch (error) {
    console.error('\n❌ Content pipeline setup failed:', error.message);
    process.exit(1);
  }
}

async function testContentPipelineIntegration() {
  try {
    // Test content templates
    console.log('   📝 Testing content templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('content_templates')
      .select('id, template_name, template_type')
      .limit(3);
    
    if (templatesError) {
      console.log(`   ❌ Templates test failed: ${templatesError.message}`);
    } else {
      console.log(`   ✅ Found ${templates.length} content templates`);
      templates.forEach(t => console.log(`      - ${t.template_name} (${t.template_type})`));
    }
    
    // Test generated content
    console.log('   📄 Testing generated content...');
    const { data: content, error: contentError } = await supabase
      .from('generated_content')
      .select('id, content_title, status')
      .limit(3);
    
    if (contentError) {
      console.log(`   ❌ Generated content test failed: ${contentError.message}`);
    } else {
      console.log(`   ✅ Found ${content.length} generated content items`);
      content.forEach(c => console.log(`      - ${c.content_title} (${c.status})`));
    }
    
    // Test analytics view
    console.log('   📊 Testing analytics view...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('content_pipeline_analytics')
      .select('*')
      .limit(3);
    
    if (analyticsError) {
      console.log(`   ❌ Analytics view test failed: ${analyticsError.message}`);
    } else {
      console.log(`   ✅ Analytics view working (${analytics.length} records)`);
    }
    
    console.log('\n🎉 Content pipeline integration test completed!');
    
  } catch (error) {
    console.error('   ❌ Integration test failed:', error.message);
  }
}

// Run the setup
if (require.main === module) {
  setupContentPipelineDatabase();
}

module.exports = { setupContentPipelineDatabase };