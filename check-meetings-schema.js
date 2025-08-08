// Check actual meetings table structure
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkMeetingsSchema() {
  try {
    console.log('🔍 Checking actual meetings table structure...');

    // Try to select with no columns to see what's available
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying meetings table:', error);
      return;
    }

    console.log('✅ meetings table accessed successfully');
    console.log('📋 Current table data sample:', data);
    
    if (data && data.length > 0) {
      console.log('📊 Available columns:', Object.keys(data[0]));
    } else {
      console.log('📭 Table is empty - trying to insert minimal record to see structure...');
      
      // Try to insert with just an id to see what other columns are required/available
      const { data: insertData, error: insertError } = await supabase
        .from('meetings')
        .insert({ })
        .select();

      if (insertError) {
        console.log('ℹ️ Insert error (shows required/available columns):', insertError.message);
      } else {
        console.log('✅ Minimal insert successful:', insertData);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkMeetingsSchema();