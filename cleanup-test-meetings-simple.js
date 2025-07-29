// cleanup-test-meetings-simple.js
/**
 * Simple script to check for NNN REIT meeting and identify test meetings via API
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function checkForNNNMeeting() {
  console.log('🔍 Searching for NNN REIT meeting...\n');
  
  try {
    const response = await fetch(`${API_BASE}/meetings?limit=50`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    // Search for NNN REIT related meetings
    const nnnMeetings = data.meetings.filter(meeting => 
      meeting.title && (
        meeting.title.toLowerCase().includes('nnn') ||
        meeting.title.toLowerCase().includes('reit') ||
        meeting.title.toLowerCase().includes('marq')
      )
    );
    
    if (nnnMeetings.length > 0) {
      console.log('✅ Found NNN REIT related meetings:');
      nnnMeetings.forEach(meeting => {
        console.log(`  📋 "${meeting.title}"`);
        console.log(`     ID: ${meeting.id}`);
        console.log(`     Date: ${meeting.date}`);
        console.log(`     Customer: ${meeting.customer}`);
        console.log(`     Has summary: ${meeting.summary ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No NNN REIT meetings found in database');
      console.log('   This means the Zapier webhook may not have fired properly.');
      console.log('   Check your Zapier logs to see if the trigger was received.\n');
    }
    
    return nnnMeetings;
    
  } catch (error) {
    console.error('❌ Error checking for NNN REIT meeting:', error.message);
    return [];
  }
}

async function identifyTestMeetings() {
  console.log('🔍 Identifying test meetings...\n');
  
  try {
    const response = await fetch(`${API_BASE}/meetings?limit=50`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    console.log(`📋 Found ${data.meetings.length} total meetings\n`);
    
    // Test meeting patterns
    const testPatterns = [
      /^Product Demo - TechFlow Solutions$/,
      /^Support Escalation - DataCorp API Issues$/,
      /^Feature Request Discussion - StartupXYZ Dashboard$/,
      /^Zapier Demo - CloudSync Technologies$/,
      /^Support Call - RetailMax API Issues$/,
      /^Feature Discussion - StartupABC Dashboard$/,
      /.*Test.*Meeting.*/i,
      /.*Basic.*Test.*/i,
      /.*Structure.*Test.*/i,
    ];
    
    const testCustomers = [
      'TechFlow Solutions',
      'DataCorp', 
      'CloudSync Technologies',
      'RetailMax',
      'StartupABC',
      'StartupXYZ',
      'TechCorp Enterprise',
      'DataFlow Inc'
    ];
    
    const testMeetings = [];
    const productionMeetings = [];
    
    data.meetings.forEach(meeting => {
      let isTest = false;
      
      // Check title patterns
      if (meeting.title) {
        isTest = testPatterns.some(pattern => pattern.test(meeting.title));
      }
      
      // Check customer patterns
      if (!isTest && meeting.customer) {
        isTest = testCustomers.some(testCustomer => 
          meeting.customer.includes(testCustomer)
        );
      }
      
      // Check for test indicators in summary
      if (!isTest && meeting.summary) {
        const testIndicators = [
          meeting.summary.includes('This is a test'),
          meeting.summary.includes('test transcript'),
          meeting.summary.length < 100 && meeting.summary.includes('test')
        ];
        isTest = testIndicators.some(indicator => indicator);
      }
      
      if (isTest) {
        testMeetings.push(meeting);
      } else {
        productionMeetings.push(meeting);
      }
    });
    
    console.log('🧪 TEST MEETINGS IDENTIFIED:');
    if (testMeetings.length === 0) {
      console.log('   No test meetings found!');
    } else {
      testMeetings.forEach(meeting => {
        console.log(`  ❌ "${meeting.title}"`);
        console.log(`     Customer: ${meeting.customer}`);
        console.log(`     Date: ${meeting.date}`);
        console.log(`     ID: ${meeting.id}`);
        console.log('');
      });
    }
    
    console.log('✅ PRODUCTION MEETINGS TO KEEP:');
    if (productionMeetings.length === 0) {
      console.log('   No production meetings found!');
    } else {
      productionMeetings.forEach(meeting => {
        console.log(`  ✅ "${meeting.title}"`);
        console.log(`     Customer: ${meeting.customer}`);
        console.log(`     Date: ${meeting.date}`);
        console.log(`     ID: ${meeting.id}`);
        console.log('');
      });
    }
    
    console.log(`📊 SUMMARY:`);
    console.log(`   Test meetings: ${testMeetings.length}`);
    console.log(`   Production meetings: ${productionMeetings.length}`);
    console.log(`   Total meetings: ${data.meetings.length}\n`);
    
    return { testMeetings, productionMeetings };
    
  } catch (error) {
    console.error('❌ Error identifying meetings:', error.message);
    return { testMeetings: [], productionMeetings: [] };
  }
}

async function main() {
  console.log('🧹 Meeting Database Analysis Tool\n');
  console.log('================================================\n');
  
  // First check for NNN REIT meeting
  const nnnMeetings = await checkForNNNMeeting();
  
  console.log('================================================\n');
  
  // Then identify test vs production meetings
  const { testMeetings, productionMeetings } = await identifyTestMeetings();
  
  console.log('================================================\n');
  
  if (testMeetings.length > 0) {
    console.log('💡 NEXT STEPS:');
    console.log('   To remove test meetings, you can:');
    console.log('   1. Use the Supabase dashboard to manually delete them');
    console.log('   2. Create a database cleanup script');  
    console.log('   3. Use the API to delete by ID\n');
    
    console.log('   Test meeting IDs to remove:');
    testMeetings.forEach(meeting => {
      console.log(`   - ${meeting.id} ("${meeting.title}")`);
    });
  } else {
    console.log('✅ No test meetings found - database is clean!');
  }
  
  console.log('\n🎉 Analysis complete!');
}

// Run the script
main().catch(console.error);