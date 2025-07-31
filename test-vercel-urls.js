#!/usr/bin/env node

// Test various possible Vercel URL patterns
const possibleUrls = [
  'https://customer-intelligence-platform.vercel.app',
  'https://ai-customer-intelligence-platform.vercel.app', 
  'https://customer-intelligence-platform-git-production.vercel.app',
  'https://customer-intelligence-platform-git-main.vercel.app',
  'https://customer-intelligence-platform-spencerkotter.vercel.app',
  'https://customer-intelligence-platform-skotter-marq.vercel.app'
];

async function testUrl(url) {
  try {
    const response = await fetch(`${url}/api/jira-webhook`);
    const text = await response.text();
    
    return {
      url,
      status: response.status,
      working: response.status === 200,
      response: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    };
  } catch (error) {
    return {
      url,
      status: 'ERROR',
      working: false,
      response: error.message
    };
  }
}

async function findWorkingUrl() {
  console.log('🔍 Testing possible Vercel URLs...\n');
  
  for (const url of possibleUrls) {
    const result = await testUrl(url);
    
    console.log(`${result.working ? '✅' : '❌'} ${url}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${result.response}`);
    console.log('');
    
    if (result.working) {
      console.log(`🎉 FOUND WORKING URL: ${url}`);
      console.log(`🔧 Update your JIRA webhook to: ${url}/api/jira-webhook`);
      break;
    }
  }
}

findWorkingUrl().catch(console.error);