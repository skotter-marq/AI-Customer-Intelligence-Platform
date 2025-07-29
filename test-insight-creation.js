const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsightCreation() {
  console.log('🧪 Testing insight creation...');
  
  // Get first meeting ID
  const { data: meetings } = await supabase
    .from('meetings')
    .select('id')
    .limit(1);
    
  if (!meetings || meetings.length === 0) {
    console.log('❌ No meetings found');
    return;
  }
  
  const meetingId = meetings[0].id;
  console.log('📝 Using meeting ID:', meetingId);
  
  // Try creating a simple insight
  const testInsight = {
    source_type: 'meeting',
    source_id: meetingId,
    insight_type: 'feature_interest', 
    title: 'Strong interest in analytics features',
    sentiment_score: 0.7,
    confidence_score: 0.85,
    priority: 'high',
    tags: ['analytics', 'feature-request']
  };
  
  const { data, error } = await supabase
    .from('insights')
    .insert(testInsight)
    .select();
    
  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Successfully created insight:', data[0].id);
    console.log('   Title:', data[0].title);
    console.log('   Priority:', data[0].priority);
    
    // Now test the dashboard insights API
    console.log('\n🔄 Testing dashboard insights API...');
    const response = await fetch('http://localhost:3000/api/dashboard-insights');
    const dashboardData = await response.json();
    
    if (dashboardData.success) {
      console.log('✅ Dashboard insights updated with live data');
      console.log(`   Found ${dashboardData.insights.length} insights`);
    }
  }
}

testInsightCreation().catch(console.error);