// test-coda-token.js
// Test if Coda API token works by listing user's documents

require('dotenv').config({ path: '.env.local' });

const apiToken = process.env.CODA_API_TOKEN;

if (!apiToken) {
  console.error('❌ CODA_API_TOKEN not found');
  process.exit(1);
}

async function testToken() {
  try {
    console.log('🧪 Testing Coda API token...');
    
    const response = await fetch('https://coda.io/apis/v1/docs', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${response.status} - ${error.message}`);
    }

    const data = await response.json();
    
    console.log('✅ API token works!');
    console.log(`📄 Found ${data.items.length} documents:`);
    
    data.items.forEach((doc, index) => {
      console.log(`   ${index + 1}. "${doc.name}"`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      URL: https://coda.io/d/${doc.id}`);
      console.log('');
    });

    return data.items;

  } catch (error) {
    console.error('❌ Token test failed:', error.message);
    process.exit(1);
  }
}

testToken();