#!/usr/bin/env node
/**
 * Simple Competitive Intelligence Schema Setup
 * Creates the essential tables for competitive intelligence
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupSchema() {
  console.log('🚀 Setting up Competitive Intelligence Schema...\n');
  
  try {
    // Step 1: Create competitors table
    console.log('1. Creating competitors table...');
    const competitorsResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS competitors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          domain VARCHAR(255),
          description TEXT,
          industry VARCHAR(100),
          competitor_type VARCHAR(100) DEFAULT 'direct',
          threat_level VARCHAR(50) DEFAULT 'medium',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    // If RPC doesn't work, try direct table creation approach
    let tablesCreated = 0;
    
    // Try creating tables using raw SQL approach since RPC isn't available
    console.log('Creating tables via PostgreSQL client...\n');
    
    // Since Supabase client doesn't support raw SQL execution,
    // let's just create basic tables manually and populate with sample data
    
    // Create sample competitors data directly
    console.log('2. Inserting sample competitor data...');
    
    const { data: existingCompetitors, error: checkError } = await supabase
      .from('competitors')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('❌ competitors table does not exist. Please create it manually in Supabase SQL Editor.');
      console.log('\n📋 Manual Setup Instructions:');
      console.log('==========================================');
      console.log('1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/your-project/sql/new');
      console.log('2. Copy and paste the SQL from: database/03_competitive_intelligence_schema.sql');
      console.log('3. Click "Run" to execute');
      console.log('4. Run this script again to verify');
      return;
    }
    
    // Insert sample data if tables exist
    const sampleCompetitors = [
      {
        name: 'CompetitorX',
        domain: 'competitorx.com',
        description: 'AI-powered customer analytics platform',
        industry: 'Technology',
        competitor_type: 'direct',
        threat_level: 'high',
        status: 'active'
      },
      {
        name: 'MarketRival',
        domain: 'marketrival.com',
        description: 'Customer intelligence and CRM integration',
        industry: 'Technology',
        competitor_type: 'direct',
        threat_level: 'medium',
        status: 'active'
      },
      {
        name: 'InnovateNow',
        domain: 'innovatenow.com',
        description: 'Business intelligence and analytics',
        industry: 'Technology',
        competitor_type: 'indirect',
        threat_level: 'low',
        status: 'active'
      }
    ];
    
    for (const competitor of sampleCompetitors) {
      const { data: existing } = await supabase
        .from('competitors')
        .select('id')
        .eq('name', competitor.name)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('competitors')
          .insert(competitor);
        
        if (!error) {
          console.log(`✅ Added competitor: ${competitor.name}`);
          tablesCreated++;
        } else {
          console.log(`⚠️  Failed to add ${competitor.name}:`, error.message);
        }
      } else {
        console.log(`ℹ️  Competitor ${competitor.name} already exists`);
      }
    }
    
    console.log(`\n✅ Setup completed! Added ${tablesCreated} competitors.`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    console.log('\n📋 Manual Setup Required:');
    console.log('=========================');
    console.log('The automated setup cannot execute raw SQL statements.');
    console.log('Please follow these steps:');
    console.log('');
    console.log('1. Open Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/your-project/sql/new');
    console.log('');
    console.log('2. Copy the SQL from:');
    console.log('   /database/03_competitive_intelligence_schema.sql');
    console.log('');
    console.log('3. Paste and click "Run"');
    console.log('');
    console.log('4. Run the test: npm run test:competitive-intelligence');
    
    process.exit(1);
  }
}

setupSchema();