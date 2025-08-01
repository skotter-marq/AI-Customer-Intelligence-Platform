import { NextResponse } from 'next/server';

// Bridge endpoint to fetch JIRA issues using the same authentication as MCP
export async function POST(request: Request) {
  try {
    const { issueKeys } = await request.json();

    if (!issueKeys || !Array.isArray(issueKeys)) {
      return NextResponse.json(
        { success: false, error: 'issueKeys array is required' },
        { status: 400 }
      );
    }

    // Since we can't directly use MCP functions in server-side code,
    // we'll make the same HTTP requests that MCP makes internally
    const axios = require('axios');
    const cloudId = '6877df8d-8ca7-4a00-b3d4-6a10b3d2f3f0';
    
    const results = [];
    const errors = [];

    for (const issueKey of issueKeys) {
      try {
        // Try the Atlassian Cloud API approach that MCP uses
        const response = await axios.get(
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${process.env.ATLASSIAN_ACCESS_TOKEN}` // Different token needed
            },
            params: {
              fields: 'summary,description,status,priority,components,labels,assignee'
            }
          }
        );

        const issue = response.data;
        results.push({
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description || '',
          status: issue.fields.status.name,
          priority: issue.fields.priority ? issue.fields.priority.name : 'Medium',
          components: issue.fields.components?.map((c: any) => c.name) || [],
          labels: issue.fields.labels || [],
          assignee: issue.fields.assignee ? issue.fields.assignee.displayName : null
        });

      } catch (error) {
        console.error(`Failed to fetch ${issueKey}:`, error.response?.status, error.response?.data);
        errors.push({
          issueKey,
          error: error.response?.data?.errorMessages?.[0] || error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      message: `Fetched ${results.length} of ${issueKeys.length} issues`
    });

  } catch (error) {
    console.error('❌ JIRA fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch JIRA issues' },
      { status: 500 }
    );
  }
}