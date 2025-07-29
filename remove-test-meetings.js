// remove-test-meetings.js
/**
 * Script to remove test meetings via database connection
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 Checking environment variables...');
console.log(`Supabase URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`Service Role Key: ${supabaseKey ? '✅ Found' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('💡 Make sure .env.local exists with the correct variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test meeting IDs to remove (from analysis)
const testMeetingIds = [
  'b812e02b-05c1-43ce-976b-64fde4029d81', // Feature Discussion - StartupABC Dashboard
  '76d669ab-aafc-42ff-97cc-87bc259ba58e', // Product Demo - TechCorp Enterprise
  '5039a255-d570-4ff0-b7cd-ecb5462f2828', // Basic Test Meeting
  '69674b56-65a5-42d4-b549-fad4142a28a4', // Structure Test Meeting
  '2b6ebbd7-9f26-4b8e-b99e-0df91cd280c1', // Structure Test Meeting
  '05f372f1-3007-4cb5-9b44-951226cb3bdd', // Feature Request Discussion - StartupXYZ Dashboard
  '3dc7282a-6409-4ce3-83c2-87ad044ee979', // Zapier Demo - CloudSync Technologies
  '1a9e159b-24c2-4e6b-9530-fa36609d8292', // Product Demo - TechFlow Solutions
  'da40dd90-1568-42dd-b6b4-cb39bcb904f0', // Support Call - RetailMax API Issues
  '121bfc0d-0c83-4986-afa0-98c9243cc4bc'  // Support Escalation - DataCorp API Issues
];

async function removeTestMeetings() {
  console.log('🗑️  Removing test meetings from database...\n');
  
  try {
    // Get meeting details before deletion for confirmation
    const { data: meetingsToDelete, error: fetchError } = await supabase
      .from('meetings')
      .select('id, title, date')
      .in('id', testMeetingIds);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('📋 Meetings to be deleted:');
    meetingsToDelete.forEach(meeting => {
      console.log(`  ❌ "${meeting.title}" (${meeting.id})`);
    });
    
    console.log(`\n🗑️  Deleting ${meetingsToDelete.length} test meetings...`);
    
    // Delete the meetings
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .in('id', testMeetingIds);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log('✅ Test meetings deleted successfully!');
    
    // Verify deletion
    const { data: remainingMeetings, error: verifyError } = await supabase
      .from('meetings')
      .select('id, title, date')
      .order('date', { ascending: false });
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log(`\n📊 Remaining meetings in database: ${remainingMeetings.length}`);
    remainingMeetings.forEach(meeting => {
      console.log(`  ✅ "${meeting.title}" (${meeting.date})`);
    });
    
    console.log('\n🎉 Database cleanup completed!');
    console.log('✅ Only production meetings remain');
    
  } catch (error) {
    console.error('❌ Error removing test meetings:', error);
  }
}

// Run the cleanup
removeTestMeetings();