require('dotenv').config({ path: '.env.local' });

const baseUrl = 'http://localhost:3000';

console.log('🧪 Testing Slack Configuration API\n');

async function testSlackConfigAPI() {
  
  // 1. Test GET templates
  console.log('1️⃣ Testing GET templates...');
  try {
    const response = await fetch(`${baseUrl}/api/slack/templates`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Templates loaded successfully');
      console.log(`   Found ${result.templates?.length || 0} templates`);
      if (result.templates && result.templates.length > 0) {
        console.log(`   First template: ${result.templates[0].name}`);
      }
    } else {
      console.log('❌ Failed to load templates:', result.error);
    }
  } catch (error) {
    console.log('❌ Error fetching templates:', error.message);
  }

  // 2. Test saving a template
  console.log('\n2️⃣ Testing save template...');
  try {
    const saveData = {
      templateId: 'approval-request',
      messageTemplate: `🔍 **CUSTOM TEST - New Content Ready for Review**

**Title:** {contentTitle}
**Type:** {contentType}
**Quality Score:** {qualityScore}%

**Custom message:** This is a test of the configuration system!

[View Content]({contentUrl})`,
      channel: '#test-approvals'
    };

    const response = await fetch(`${baseUrl}/api/slack/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Template saved successfully');
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ Failed to save template:', result.error);
    }
  } catch (error) {
    console.log('❌ Error saving template:', error.message);
  }

  // 3. Test template with variables
  console.log('\n3️⃣ Testing template test functionality...');
  try {
    const testData = {
      action: 'test_template',
      templateId: 'approval-request',
      messageTemplate: `🧪 **TEST MESSAGE**

**Title:** {contentTitle}
**Quality Score:** {qualityScore}%
**Created:** {createdDate}

This is a test message from the configuration system!`,
      channel: '#test-channel',
      testData: {
        contentTitle: 'Sample Product Update',
        qualityScore: 95,
        createdDate: new Date().toLocaleDateString()
      }
    };

    const response = await fetch(`${baseUrl}/api/slack/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Template test successful');
      console.log(`   Channel: ${result.channel}`);
      console.log('   Preview:');
      console.log('   ' + result.previewMessage.split('\n').join('\n   '));
    } else {
      console.log('❌ Template test failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error testing template:', error.message);
  }

  console.log('\n🎉 Slack configuration API testing complete!');
  console.log('\n💡 Next steps:');
  console.log('   • Visit http://localhost:3000/slack/configuration');
  console.log('   • Customize message templates');
  console.log('   • Test with real Slack tokens');
}

testSlackConfigAPI().catch(console.error);