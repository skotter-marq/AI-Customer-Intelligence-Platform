// list-coda-tables.js
// List all tables in a specific Coda document

require('dotenv').config({ path: '.env.local' });

const apiToken = process.env.CODA_API_TOKEN;
const docId = 'mvPE9MgCn7'; // Marq Revamp document

async function listTables() {
  try {
    console.log(`🔍 Listing tables in document: ${docId}`);
    
    const response = await fetch(`https://coda.io/apis/v1/docs/${docId}/tables`, {
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
    
    console.log(`✅ Found ${data.items.length} tables:`);
    console.log('');
    
    data.items.forEach((table, index) => {
      console.log(`   ${index + 1}. "${table.name}"`);
      console.log(`      ID: ${table.id}`);
      console.log(`      Type: ${table.tableType}`);
      console.log(`      Columns: ${table.columns?.length || 'Unknown'}`);
      console.log(`      URL: https://coda.io/d/${docId}#_table_${table.id}`);
      console.log('');
    });

    return data.items;

  } catch (error) {
    console.error('❌ Failed to list tables:', error.message);
    process.exit(1);
  }
}

listTables();