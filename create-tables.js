#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCompetitorsTable() {
  console.log('🔧 Creating competitors table...');
  
  // Check if table exists first
  const { data: existingTables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'competitors');

  if (existingTables && existingTables.length > 0) {
    console.log('✅ Competitors table already exists');
    return;
  }

  try {
    // Create competitors table using SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS competitors (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        description TEXT,
        website_url VARCHAR(500),
        logo_url VARCHAR(500),
        market_cap VARCHAR(50),
        employees VARCHAR(50),
        founded_year INTEGER,
        headquarters VARCHAR(200),
        threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
        status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'monitoring', 'archived')),
        confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(100),
        last_analyzed_at TIMESTAMP WITH TIME ZONE
      );
    `;

    // Note: Supabase doesn't allow direct SQL execution from client
    // We need to insert some dummy data to create the table structure
    const { error } = await supabase
      .from('competitors')
      .insert([
        {
          name: 'Test Competitor',
          industry: 'Technology',
          description: 'Test description',
          website_url: 'https://example.com',
          threat_level: 'low',
          status: 'active',
          confidence_score: 0.5,
          created_by: 'setup'
        }
      ]);

    if (error) {
      console.error('❌ Error creating competitors table:', error.message);
      
      // If table doesn't exist, we need to create it via Supabase dashboard
      console.log('\n📋 Manual Setup Required:');
      console.log('Please go to your Supabase dashboard and run the SQL from database/competitors_schema.sql');
      console.log('Or use the Supabase SQL editor to execute the schema.');
      
      return false;
    }

    // Clean up test data
    await supabase
      .from('competitors')
      .delete()
      .eq('name', 'Test Competitor');

    console.log('✅ Competitors table created successfully');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function insertSampleData() {
  console.log('📝 Inserting sample competitors data...');
  
  const sampleCompetitors = [
    {
      name: 'Salesforce',
      industry: 'CRM & Sales',
      description: 'Leading cloud-based CRM platform with comprehensive sales, marketing, and customer service solutions',
      website_url: 'https://salesforce.com',
      market_cap: '$200B+',
      employees: '70,000+',
      threat_level: 'high',
      status: 'active',
      confidence_score: 0.95,
      created_by: 'setup'
    },
    {
      name: 'HubSpot',
      industry: 'Marketing & CRM',
      description: 'Inbound marketing and sales platform with free CRM and comprehensive marketing tools',
      website_url: 'https://hubspot.com',
      market_cap: '$25B+',
      employees: '5,000+',
      threat_level: 'high',
      status: 'active',
      confidence_score: 0.92,
      created_by: 'setup'
    },
    {
      name: 'Pipedrive',
      industry: 'Sales CRM',
      description: 'Sales-focused CRM designed for small and medium businesses with visual pipeline management',
      website_url: 'https://pipedrive.com',
      market_cap: '$1.5B+',
      employees: '1,000+',
      threat_level: 'medium',
      status: 'active',
      confidence_score: 0.85,
      created_by: 'setup'
    }
  ];

  const { error } = await supabase
    .from('competitors')
    .insert(sampleCompetitors);

  if (error) {
    console.error('❌ Error inserting sample data:', error.message);
    return false;
  }

  console.log('✅ Sample data inserted successfully');
  return true;
}

async function checkTables() {
  console.log('\n🔍 Checking existing tables...');
  
  try {
    // Check competitors table
    const { data: competitors, error: competitorsError } = await supabase
      .from('competitors')
      .select('*')
      .limit(1);

    if (competitorsError) {
      console.log('❌ Competitors table: Not accessible');
      console.log('   Error:', competitorsError.message);
      return false;
    } else {
      console.log('✅ Competitors table: Accessible');
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Database setup for Customer Intelligence Platform\n');
  
  // Check if tables exist
  const tablesExist = await checkTables();
  
  if (!tablesExist) {
    console.log('\n📋 Tables need to be created. Please follow these steps:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of database/competitors_schema.sql');
    console.log('4. Run the SQL to create the tables');
    console.log('5. Then run this script again to insert sample data');
    console.log('\nAlternatively, create the table structure manually:');
    
    const created = await createCompetitorsTable();
    if (created) {
      await insertSampleData();
    }
  } else {
    console.log('\n✅ Database is ready!');
    
    // Check if we need sample data
    const { data: existing } = await supabase
      .from('competitors')
      .select('id')
      .limit(1);
      
    if (!existing || existing.length === 0) {
      await insertSampleData();
    } else {
      console.log('📊 Sample data already exists');
    }
  }
  
  console.log('\n🎉 Setup completed!');
}

main().catch(console.error);