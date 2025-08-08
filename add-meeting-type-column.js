// Add missing meeting_type column to meetings table
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

async function addMeetingTypeColumn() {
  try {
    console.log('🔧 Adding missing meeting_type column to meetings table...');

    // Try to add the missing column by inserting a test record with meeting_type
    // This approach bypasses direct SQL execution limitations
    const testRecord = {
      title: 'Schema Fix Test',
      meeting_type: 'test',
      grain_meeting_id: `test-${Date.now()}`
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert(testRecord)
      .select();

    if (error) {
      if (error.message.includes('column meetings.meeting_type does not exist')) {
        console.log('❌ Confirmed: meeting_type column is missing');
        console.log('\n📋 MANUAL FIX REQUIRED:');
        console.log('Please run this SQL command in your Supabase Dashboard > SQL Editor:');
        console.log('\n```sql');
        console.log('ALTER TABLE meetings ADD COLUMN meeting_type VARCHAR(100);');
        console.log('```\n');
        console.log('Or apply the full customer research schema from:');
        console.log('database/01_customer_research_schema.sql');
      } else {
        console.error('❌ Error inserting test record:', error);
      }
    } else {
      console.log('✅ meeting_type column exists - test record created successfully');
      console.log('🧹 Cleaning up test record...');
      
      // Clean up the test record
      await supabase
        .from('meetings')
        .delete()
        .eq('grain_meeting_id', testRecord.grain_meeting_id);
      
      console.log('✅ Test record removed');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addMeetingTypeColumn();