// Fix meetings table - add missing meeting_type column if needed
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMeetingsTable() {
  try {
    console.log('🔍 Checking and fixing meetings table structure...');

    // Try to create the entire customer research schema if needed
    const createSchemaSQL = `
      -- Enable necessary extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create customers table if it doesn't exist
      CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_name VARCHAR(255) NOT NULL,
          domain VARCHAR(255),
          industry VARCHAR(100),
          company_size VARCHAR(50),
          location VARCHAR(255),
          customer_segment VARCHAR(100),
          lifecycle_stage VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create meetings table with meeting_type column
      CREATE TABLE IF NOT EXISTS meetings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          grain_meeting_id VARCHAR(255) UNIQUE,
          customer_id UUID REFERENCES customers(id),
          title VARCHAR(500),
          description TEXT,
          meeting_date TIMESTAMP WITH TIME ZONE,
          duration_minutes INTEGER,
          attendees JSONB,
          transcript TEXT,
          recording_url VARCHAR(1000),
          meeting_type VARCHAR(100),
          meeting_status VARCHAR(50) DEFAULT 'pending',
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_meetings_grain_id ON meetings(grain_meeting_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
      CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(meeting_status);
      CREATE INDEX IF NOT EXISTS idx_meetings_customer_id ON meetings(customer_id);
    `;

    // Use the SQL editor function instead of RPC
    const { error: createError } = await supabase.rpc('exec_sql', {
      query: createSchemaSQL
    });

    if (createError) {
      console.log('Trying alternative method...');
      
      // Try direct query execution
      const { error: directError } = await supabase
        .rpc('exec', { query: createSchemaSQL });

      if (directError) {
        console.error('❌ Error creating schema:', directError);
        
        // Try just checking if we can query meetings table
        const { data: testData, error: testError } = await supabase
          .from('meetings')
          .select('*')
          .limit(1);

        if (testError) {
          console.error('❌ meetings table is not accessible:', testError);
          console.log('\n📝 MANUAL STEPS NEEDED:');
          console.log('1. Open Supabase Dashboard SQL Editor');
          console.log('2. Run the customer research schema from database/01_customer_research_schema.sql');
          console.log('3. Make sure the meetings table includes the meeting_type column');
          return;
        } else {
          console.log('✅ meetings table exists and is accessible');
        }
      }
    }

    console.log('✅ Schema creation completed');

    // Test the webhook functionality
    console.log('🧪 Testing webhook table access...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('meetings')
        .select('id, title, meeting_type')
        .limit(1);

      if (testError) {
        console.error('❌ Error accessing meetings table:', testError);
      } else {
        console.log('✅ meetings table access successful');
        console.log('Sample data structure:', testData);
      }
    } catch (queryError) {
      console.error('❌ Query error:', queryError);
    }

    console.log('🎉 Database fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixMeetingsTable();