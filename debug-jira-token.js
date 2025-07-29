require('dotenv').config({ path: '.env.local' });

const baseUrl = process.env.JIRA_BASE_URL;
const apiToken = process.env.JIRA_API_TOKEN;
const username = process.env.JIRA_USERNAME;

console.log('🔍 JIRA Token Debug');
console.log('==================');
console.log('Base URL:', baseUrl);
console.log('Username:', username);
console.log('API Token Length:', apiToken ? apiToken.length : 'NOT SET');
console.log('API Token (first 10 chars):', apiToken ? apiToken.substring(0, 10) : 'NOT SET');
console.log('API Token (last 10 chars):', apiToken ? '...' + apiToken.substring(apiToken.length - 10) : 'NOT SET');

// Check for any hidden characters
console.log('\nToken character analysis:');
if (apiToken) {
  const tokenBytes = Buffer.from(apiToken, 'utf8');
  console.log('Token as hex:', tokenBytes.toString('hex').substring(0, 40) + '...');
  
  // Check for common issues
  const hasNewlines = apiToken.includes('\n');
  const hasCarriageReturns = apiToken.includes('\r');
  const hasSpaces = apiToken.includes(' ');
  const hasTabs = apiToken.includes('\t');
  
  console.log('Has newlines:', hasNewlines);
  console.log('Has carriage returns:', hasCarriageReturns);
  console.log('Has spaces:', hasSpaces);
  console.log('Has tabs:', hasTabs);
  
  // Clean token
  const cleanToken = apiToken.trim().replace(/\s+/g, '');
  console.log('Clean token length:', cleanToken.length);
  console.log('Original vs clean different:', apiToken !== cleanToken);
}

// Test basic auth encoding
if (username && apiToken) {
  const authString = `${username}:${apiToken.trim()}`;
  const base64Auth = Buffer.from(authString, 'utf8').toString('base64');
  console.log('\nAuth encoding:');
  console.log('Auth string preview:', authString.substring(0, 30) + '...');
  console.log('Base64 preview:', base64Auth.substring(0, 50) + '...');
}