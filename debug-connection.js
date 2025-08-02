const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugConnection() {
  console.log('🔍 Debugging Supabase connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Environment variables:');
  console.log('  SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('  SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
      console.log('  Sample AI prompt:', data?.[0] || 'No data found');
    }
    
    // Test slack templates
    const { data: slackData, error: slackError } = await supabase
      .from('slack_templates')
      .select('id, name')
      .limit(1);
    
    if (slackError) {
      console.error('❌ Slack templates query failed:', slackError.message);
    } else {  
      console.log('✅ Slack templates accessible');
      console.log('  Sample template:', slackData?.[0] || 'No data found');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

debugConnection();