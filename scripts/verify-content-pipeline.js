#!/usr/bin/env node
/**
 * Content Pipeline Verification Script
 * Verifies that all content pipeline database tables and components are working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyContentPipeline() {
  try {
    console.log('🔍 Verifying Content Pipeline Setup...\n');
    
    const verificationResults = {
      tablesVerified: 0,
      tablesTotal: 0,
      viewsVerified: 0,
      viewsTotal: 0,
      functionsVerified: 0,
      functionsTotal: 0,
      errors: []
    };
    
    // Test all content pipeline tables
    const requiredTables = [
      'content_templates',
      'generated_content',
      'content_data_sources',
      'content_campaign_assignments', 
      'content_approval_workflow',
      'pipeline_execution_logs',
      'content_analytics',
      'content_feedback',
      'content_versions',
      'content_performance_metrics'
    ];
    
    console.log('📋 Verifying Tables:');
    verificationResults.tablesTotal = requiredTables.length;
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
          verificationResults.errors.push(`Table ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}`);
          verificationResults.tablesVerified++;
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
        verificationResults.errors.push(`Table ${tableName}: ${error.message}`);
      }
    }
    
    // Test views
    const requiredViews = [
      'content_pipeline_analytics',
      'content_approval_status'
    ];
    
    console.log('\n📊 Verifying Views:');
    verificationResults.viewsTotal = requiredViews.length;
    
    for (const viewName of requiredViews) {
      try {
        const { data, error } = await supabase
          .from(viewName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${viewName}: ${error.message}`);
          verificationResults.errors.push(`View ${viewName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${viewName}`);
          verificationResults.viewsVerified++;
        }
      } catch (error) {
        console.log(`   ❌ ${viewName}: ${error.message}`);
        verificationResults.errors.push(`View ${viewName}: ${error.message}`);
      }
    }
    
    // Test sample data
    console.log('\n📝 Verifying Sample Data:');
    
    try {
      const { data: templates, error: templatesError } = await supabase
        .from('content_templates')
        .select('id, template_name, template_type, is_active')
        .eq('is_active', true);
      
      if (templatesError) {
        console.log(`   ❌ Templates query failed: ${templatesError.message}`);
        verificationResults.errors.push(`Templates: ${templatesError.message}`);
      } else {
        console.log(`   ✅ Found ${templates.length} active templates`);
        templates.forEach(t => {
          console.log(`      - ${t.template_name} (${t.template_type})`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Sample data test failed: ${error.message}`);
      verificationResults.errors.push(`Sample data: ${error.message}`);
    }
    
    // Test content pipeline components
    console.log('\n🧪 Testing Content Pipeline Components:');
    
    try {
      // Test ContentTemplates class
      console.log('   📚 Testing ContentTemplates class...');
      const ContentTemplates = require('../lib/content-templates.js');
      const contentTemplates = new ContentTemplates();
      
      const templates = await contentTemplates.getTemplates();
      console.log(`   ✅ ContentTemplates.getTemplates() returned ${templates.length} templates`);
      
      if (templates.length > 0) {
        const firstTemplate = await contentTemplates.getTemplate(templates[0].id);
        console.log(`   ✅ ContentTemplates.getTemplate() worked for '${firstTemplate.template_name}'`);
      }
      
    } catch (error) {
      console.log(`   ❌ ContentTemplates test failed: ${error.message}`);
      verificationResults.errors.push(`ContentTemplates: ${error.message}`);
    }
    
    try {
      // Test ContentGenerationEngine class  
      console.log('   🎯 Testing ContentGenerationEngine class...');
      const ContentGenerationEngine = require('../lib/content-generation-engine.js');
      const contentEngine = new ContentGenerationEngine();
      
      const analytics = await contentEngine.getGenerationAnalytics(7);
      console.log(`   ✅ ContentGenerationEngine.getGenerationAnalytics() returned analytics for ${analytics.total_content} items`);
      
    } catch (error) {
      console.log(`   ❌ ContentGenerationEngine test failed: ${error.message}`);
      verificationResults.errors.push(`ContentGenerationEngine: ${error.message}`);
    }
    
    try {
      // Test ContentPipelineOrchestrator class
      console.log('   🎼 Testing ContentPipelineOrchestrator class...');
      const ContentPipelineOrchestrator = require('../lib/content-pipeline-orchestrator.js');
      const orchestrator = new ContentPipelineOrchestrator();
      
      const health = await orchestrator.getPipelineHealth();
      console.log(`   ✅ ContentPipelineOrchestrator.getPipelineHealth() returned status: ${health.overall_status}`);
      
    } catch (error) {
      console.log(`   ❌ ContentPipelineOrchestrator test failed: ${error.message}`);
      verificationResults.errors.push(`ContentPipelineOrchestrator: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 Verification Summary:');
    console.log(`   Tables: ${verificationResults.tablesVerified}/${verificationResults.tablesTotal} verified`);
    console.log(`   Views: ${verificationResults.viewsVerified}/${verificationResults.viewsTotal} verified`);
    console.log(`   Components: ${3 - verificationResults.errors.filter(e => e.includes('Templates') || e.includes('Engine') || e.includes('Orchestrator')).length}/3 working`);
    
    const totalSuccess = verificationResults.tablesVerified + verificationResults.viewsVerified;
    const totalItems = verificationResults.tablesTotal + verificationResults.viewsTotal;
    const successRate = ((totalSuccess / totalItems) * 100).toFixed(1);
    
    console.log(`   Overall Success Rate: ${successRate}%`);
    
    if (verificationResults.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      verificationResults.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
      
      console.log('\n🔧 Recommended Actions:');
      console.log('   1. Make sure you have executed the content-pipeline-schema.sql in Supabase');
      console.log('   2. Check that all environment variables are set correctly');
      console.log('   3. Verify your Supabase connection and permissions');
      console.log('   4. Run: node scripts/setup-content-pipeline.js');
    } else {
      console.log('\n🎉 Content Pipeline Verification Complete!');
      console.log('✅ All components verified successfully');
      console.log('\n🚀 Next Steps:');
      console.log('   1. The content pipeline is ready to use');
      console.log('   2. You can now generate content using the pipeline');
      console.log('   3. Test with: node scripts/test-content-generation.js');
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  verifyContentPipeline();
}

module.exports = { verifyContentPipeline };