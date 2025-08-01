#!/usr/bin/env node

/**
 * JIRA Authentication Debug Tool
 * Tests various authentication methods and provides detailed error information
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function debugJiraAuth() {
  const baseUrl = process.env.JIRA_BASE_URL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const username = process.env.JIRA_USERNAME;
  
  console.log('🔧 JIRA Authentication Debug');
  console.log('============================');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Username: ${username}`);
  console.log(`Token: ${apiToken?.substring(0, 20)}...${apiToken?.substring(apiToken.length - 10)}`);
  console.log(`Token length: ${apiToken?.length}`);
  console.log('');
  
  // Test 1: Basic connectivity
  console.log('🌐 Test 1: Basic connectivity to JIRA instance...');
  try {
    const response = await axios.get(baseUrl, { timeout: 10000 });
    console.log(`✅ JIRA instance is accessible (HTTP ${response.status})`);
  } catch (error) {
    console.log(`❌ Cannot reach JIRA instance: ${error.message}`);
    return;
  }
  
  // Test 2: API endpoint without auth
  console.log('\n🔓 Test 2: Testing API endpoint without authentication...');
  try {
    const response = await axios.get(`${baseUrl}/rest/api/3/myself`);
    console.log('✅ No auth required (unexpected!)');
  } catch (error) {
    console.log(`✅ Auth required as expected (HTTP ${error.response?.status})`);
  }
  
  // Test 3: Test with current credentials
  console.log('\n🔑 Test 3: Testing with current API token...');
  try {
    const response = await axios.get(`${baseUrl}/rest/api/3/myself`, {
      auth: {
        username: username,
        password: apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Authentication successful!');
    console.log(`   User: ${response.data.displayName}`);
    console.log(`   Account ID: ${response.data.accountId}`);
    console.log(`   Email: ${response.data.emailAddress}`);
    
    return true; // Success
    
  } catch (error) {
    console.log(`❌ Authentication failed (HTTP ${error.response?.status})`);
    if (error.response?.data) {
      console.log(`   Error details:`, error.response.data);
    }
  }
  
  // Test 4: Try with just email part of username
  if (username.includes('@')) {
    const emailUser = username.split('@')[0];
    console.log(`\n🔄 Test 4: Trying with username without domain (${emailUser})...`);
    try {
      const response = await axios.get(`${baseUrl}/rest/api/3/myself`, {
        auth: {
          username: emailUser,
          password: apiToken
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('✅ Authentication successful with username without domain!');
      console.log(`   User: ${response.data.displayName}`);
      return true;
    } catch (error) {
      console.log(`❌ Still failed with username without domain (HTTP ${error.response?.status})`);
    }
  }
  
  // Test 5: Check token format
  console.log('\n🔍 Test 5: Token format analysis...');
  if (apiToken) {
    console.log(`   Starts with ATATT: ${apiToken.startsWith('ATATT')}`);
    console.log(`   Contains expected chars: ${/^ATATT[A-Za-z0-9_-]+$/.test(apiToken)}`);
    console.log(`   Length within expected range: ${apiToken.length >= 100 && apiToken.length <= 200}`);
  }
  
  console.log('\n💡 Recommendations:');
  console.log('1. Verify the API token is still valid in JIRA settings');
  console.log('2. Check if the token has the required permissions');
  console.log('3. Try regenerating the API token');
  console.log('4. Verify the username/email is correct');
  
  return false;
}

console.log('Starting JIRA authentication debug...\n');
debugJiraAuth().then(success => {
  console.log(`\n🏁 Debug complete. Authentication ${success ? 'SUCCESSFUL' : 'FAILED'}`);
}).catch(error => {
  console.error('❌ Debug script error:', error.message);
});