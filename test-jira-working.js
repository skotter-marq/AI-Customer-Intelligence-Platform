require('dotenv').config({ path: '.env.local' });

const baseUrl = process.env.JIRA_BASE_URL;
const apiToken = process.env.JIRA_API_TOKEN;
const username = process.env.JIRA_USERNAME;
const projectKey = process.env.JIRA_PROJECT_KEY;

console.log('🎉 Testing JIRA Connection (Browser Auth Successful!)...\n');

async function testJiraConnection() {
  try {
    // Debug authentication details
    console.log('🔐 Testing authentication...');
    console.log('Base URL:', baseUrl);
    console.log('Username:', username);
    console.log('API Token (first 20 chars):', apiToken ? apiToken.substring(0, 20) + '...' : 'NOT SET');
    
    const authString = `${username}:${apiToken}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    console.log('Auth string length:', authString.length);
    console.log('Base64 auth (first 40 chars):', base64Auth.substring(0, 40) + '...');
    
    const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`❌ Authentication failed (${response.status}): ${await response.text()}`);
      return false;
    }

    const userInfo = await response.json();
    console.log(`✅ Authentication successful! Welcome, ${userInfo.displayName}!`);
    console.log(`   Account ID: ${userInfo.accountId}`);
    console.log(`   Email: ${userInfo.emailAddress}`);
    console.log(`   Time Zone: ${userInfo.timeZone}`);

    // Test project access
    console.log('\n🗂️  Testing project access...');
    const projectResponse = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${username}:${apiToken}`).toString('base64'),
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CustomerIntelligencePlatform/1.0)'
      }
    });

    if (!projectResponse.ok) {
      console.log(`❌ Project '${projectKey}' not accessible (${projectResponse.status})`);
      
      // List available projects
      const projectsResponse = await fetch(`${baseUrl}/rest/api/3/project/search`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${username}:${apiToken}`).toString('base64'),
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; CustomerIntelligencePlatform/1.0)'
        }
      });

      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        console.log('\n📋 Available projects:');
        projects.values.slice(0, 10).forEach(project => {
          console.log(`   • ${project.key}: ${project.name}`);
        });
      }
      return false;
    }

    const projectInfo = await projectResponse.json();
    console.log(`✅ Project access successful! Project: ${projectInfo.name} (${projectInfo.key})`);

    // Test issues
    console.log('\n📋 Testing issue access...');
    const issuesResponse = await fetch(`${baseUrl}/rest/api/3/search?jql=project=${projectKey}&maxResults=3`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${username}:${apiToken}`).toString('base64'),
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CustomerIntelligencePlatform/1.0)'
      }
    });

    if (issuesResponse.ok) {
      const issues = await issuesResponse.json();
      console.log(`✅ Issues access successful! Found ${issues.total} total issues`);
      
      if (issues.issues.length > 0) {
        console.log('\n📝 Recent issues:');
        issues.issues.forEach(issue => {
          console.log(`   • ${issue.key}: ${issue.fields.summary}`);
        });
      }
    }

    console.log('\n🚀 JIRA Integration Status: READY FOR PRODUCTION!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Authentication working');
    console.log('   ✅ Project access confirmed');
    console.log('   ✅ API endpoints responding');
    console.log('\n👉 Next: Add these 4 variables to Vercel and redeploy!');
    
    return true;

  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

testJiraConnection();