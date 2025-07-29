// create-test-meeting.js
// Script to create a test meeting for Coda integration testing

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestMeeting() {
  try {
    console.log('🧪 Creating test meeting for Coda integration...');

    const testMeeting = {
      title: "Product Demo - DesignTech Solutions",
      date: new Date().toISOString(),
      duration_minutes: 45,
      participants: ["Sarah Johnson (DesignTech)", "Mike Chen (Sales)", "Alex Rivera (Product)"],
      grain_id: `test-${Date.now()}`,
      customer_id: null,
      raw_transcript: `Mike: Thanks for joining us today, Sarah. I'm excited to show you our latest platform capabilities.

Sarah: Great! We've been looking for a solution that can help us with content creation and data management. Our current process is quite manual and error-prone.

Mike: Perfect, let me walk you through our key features. First, our content editor allows you to create professional documents with smart templates.

Sarah: That looks interesting. One thing we struggle with is access control. We need appropriate access to locked elements so we can adapt the content to our specific needs. Sometimes templates are too rigid and we can't customize them for our brand.

Mike: Absolutely, we have granular permission settings that allow different access levels.

Alex: Sarah, what about your image workflow?

Sarah: Oh, that's a big pain point for us. We need to effectively manage and manipulate images so we can produce professional-looking content. Right now we're using multiple tools and it's very time-consuming. We spend hours just resizing and formatting images.

Alex: Our platform has built-in image editing with batch processing capabilities. You can resize, crop, and optimize images in bulk.

Sarah: That would save us so much time! Another major issue is data entry. We need to easily incorporate accurate data so we can produce content quickly without manual entry errors. We have spreadsheets with customer data but copying it manually leads to mistakes.

Mike: We have smart fields and data automations that can pull directly from your existing systems.

Sarah: This looks very promising. What about pricing and implementation timeline?

Mike: Let me get you a custom quote. When would you ideally want to go live?

Sarah: We'd love to implement this by end of Q1 if possible. The manual processes are really slowing us down and affecting our client delivery timelines.

Alex: That's definitely achievable. We can have you up and running in 6-8 weeks.

Sarah: Excellent! I'll need to present this to our team next week. Can you send me some references from similar agencies?

Mike: Absolutely. I'll send you case studies from three design agencies that saw 40% efficiency improvements.

Sarah: Perfect. I'm really impressed with what I've seen today. This addresses all our major pain points.

Mike: Great! I'll follow up with the proposal and references by tomorrow.

Sarah: Sounds good. Thank you for the comprehensive demo!`,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert([testMeeting])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Test meeting created successfully!');
    console.log('📋 Meeting Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Date: ${data.date}`);
    console.log(`   Duration: ${data.duration_minutes} minutes`);
    console.log(`   Participants: ${data.participants.length} people`);
    console.log(`   Transcript Length: ${data.raw_transcript.length} characters`);
    
    console.log('\n🧠 JTBD Analysis Preview:');
    console.log('This transcript contains mentions of all three default JTBD areas:');
    console.log('1. ✅ Access to locked elements: "appropriate access to locked elements"');
    console.log('2. ✅ Image management: "effectively manage and manipulate images"');
    console.log('3. ✅ Data automation: "easily incorporate accurate data", "data automations"');
    
    console.log('\n🎯 Perfect for testing your enhanced Coda integration!');
    console.log('You can now:');
    console.log('- Go to your meetings dashboard');
    console.log('- Find the "Product Demo - DesignTech Solutions" meeting');
    console.log('- Click the Coda button to test the integration');
    console.log('- Enable AI analysis to see JTBD insights extracted');

    return data;

  } catch (error) {
    console.error('❌ Failed to create test meeting:', error);
    process.exit(1);
  }
}

// Run the script
createTestMeeting()
  .then(() => {
    console.log('\n🚀 Test meeting ready for Coda integration testing!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });