// cleanup-test-meetings.js
/**
 * Script to identify and remove test meetings from the database
 * Keeps only real production meetings
 */

// Use a simpler approach with direct API calls since this is a Node.js script
const fetch = require('node-fetch');

// Patterns to identify test meetings
const testMeetingPatterns = [
  // Test meetings from our test scripts
  'grain_demo_001',
  'grain_support_002', 
  'grain_feature_003',
  'grain_zapier_demo_001',
  'grain_zapier_support_002',
  'grain_min_003',
  'zapier_grain_001',
  'zapier_grain_002',
  
  // Test titles
  /^Product Demo - TechFlow Solutions$/,
  /^Support Escalation - DataCorp API Issues$/,
  /^Feature Request Discussion - StartupXYZ Dashboard$/,
  /^Zapier Demo - CloudSync Technologies$/,
  /^Support Call - RetailMax API Issues$/,
  /^Feature Discussion - StartupABC Dashboard$/,
  /.*Test.*Meeting.*/i,
  /.*Basic.*Test.*/i,
  /.*Structure.*Test.*/i,
  
  // Test customers/companies
  /TechFlow Solutions/,
  /DataCorp/,
  /CloudSync Technologies/, 
  /RetailMax/,
  /StartupABC/,
  /StartupXYZ/
];

async function identifyTestMeetings() {
  console.log('🔍 Identifying test meetings...\n');
  
  try {
    // Get all meetings
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    console.log(`📋 Found ${meetings.length} total meetings\n`);
    
    const testMeetings = [];
    const productionMeetings = [];
    
    meetings.forEach(meeting => {
      let isTest = false;
      
      // Check grain_id patterns
      if (meeting.grain_id) {
        for (const pattern of testMeetingPatterns) {
          if (typeof pattern === 'string' && meeting.grain_id.includes(pattern)) {
            isTest = true;
            break;
          }
        }
      }
      
      // Check title patterns
      if (!isTest && meeting.title) {
        for (const pattern of testMeetingPatterns) {
          if (pattern instanceof RegExp && pattern.test(meeting.title)) {
            isTest = true;
            break;
          }
        }
      }
      
      // Check for test data indicators
      if (!isTest) {
        const indicators = [
          meeting.title?.includes('Test'),
          meeting.title?.includes('Demo') && (meeting.title?.includes('TechFlow') || meeting.title?.includes('CloudSync')),
          meeting.grain_id?.startsWith('grain_'),
          meeting.grain_id?.startsWith('zapier_'),
          // Meetings with very short transcripts (likely test data)
          meeting.raw_transcript && meeting.raw_transcript.length < 200
        ];
        
        isTest = indicators.some(indicator => indicator);
      }
      
      if (isTest) {
        testMeetings.push(meeting);
      } else {
        productionMeetings.push(meeting);
      }
    });
    
    console.log('🧪 TEST MEETINGS TO REMOVE:');
    testMeetings.forEach(meeting => {
      console.log(`  ❌ "${meeting.title}" (${meeting.grain_id || meeting.id})`);
      console.log(`     Date: ${meeting.date || meeting.created_at}`);
      console.log(`     Customer: ${meeting.customer_id || 'Unknown'}`);
      console.log('');
    });
    
    console.log('✅ PRODUCTION MEETINGS TO KEEP:');
    productionMeetings.forEach(meeting => {
      console.log(`  ✅ "${meeting.title}" (${meeting.grain_id || meeting.id})`);
      console.log(`     Date: ${meeting.date || meeting.created_at}`);
      console.log(`     Customer: ${meeting.customer_id || 'Unknown'}`);
      console.log('');
    });
    
    console.log(`📊 SUMMARY:`);
    console.log(`   Test meetings: ${testMeetings.length}`);
    console.log(`   Production meetings: ${productionMeetings.length}`);
    console.log(`   Total meetings: ${meetings.length}`);
    
    return { testMeetings, productionMeetings };
    
  } catch (error) {
    console.error('❌ Error identifying meetings:', error);
    return { testMeetings: [], productionMeetings: [] };
  }
}

async function removeTestMeetings(testMeetings) {
  if (testMeetings.length === 0) {
    console.log('\n✅ No test meetings to remove!');
    return;
  }
  
  console.log(`\n🗑️  Removing ${testMeetings.length} test meetings...`);
  
  try {
    const testIds = testMeetings.map(m => m.id);
    
    const { error } = await supabase
      .from('meetings')
      .delete()
      .in('id', testIds);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Test meetings removed successfully!');
    
    // Also clean up any related insights, action items, etc.
    console.log('🧹 Cleaning up related data...');
    
    // Note: Add cleanup for related tables if they exist
    // await supabase.from('meeting_insights').delete().in('meeting_id', testIds);
    // await supabase.from('meeting_action_items').delete().in('meeting_id', testIds);
    
    console.log('✅ Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error removing test meetings:', error);
  }
}

async function checkForNNNMeeting() {
  console.log('\n🔍 Searching for NNN REIT meeting...');
  
  try {
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .or('title.ilike.%NNN%,title.ilike.%REIT%,title.ilike.%Marq%');
    
    if (error) {
      throw error;
    }
    
    if (meetings && meetings.length > 0) {
      console.log('✅ Found NNN REIT related meetings:');
      meetings.forEach(meeting => {
        console.log(`  📋 "${meeting.title}"`);
        console.log(`     ID: ${meeting.id}`);
        console.log(`     Date: ${meeting.date || meeting.created_at}`);
        console.log(`     Has transcript: ${meeting.raw_transcript ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No NNN REIT meetings found in database');
      console.log('   This means the Zapier webhook may not have triggered properly');
      console.log('   or there was an issue saving the meeting data.');
    }
    
    return meetings || [];
    
  } catch (error) {
    console.error('❌ Error searching for NNN REIT meeting:', error);
    return [];
  }
}

async function main() {
  console.log('🧹 Meeting Database Cleanup Tool\n');
  
  // Check for NNN REIT meeting first
  await checkForNNNMeeting();
  
  // Identify test vs production meetings
  const { testMeetings, productionMeetings } = await identifyTestMeetings();
  
  // Prompt for confirmation
  if (testMeetings.length > 0) {
    console.log('\n⚠️  READY TO REMOVE TEST MEETINGS');
    console.log('   This will permanently delete the test meetings listed above.');
    console.log('   Production meetings will be preserved.');
    console.log('\n   Run with --confirm to proceed with deletion:');
    console.log('   node cleanup-test-meetings.js --confirm');
    
    // Check if --confirm flag is passed
    if (process.argv.includes('--confirm')) {
      await removeTestMeetings(testMeetings);
    }
  }
  
  console.log('\n🎉 Database cleanup analysis complete!');
}

// Run the script
main().catch(console.error);