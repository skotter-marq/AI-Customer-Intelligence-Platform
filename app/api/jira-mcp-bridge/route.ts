import { NextResponse } from 'next/server';

// Bridge endpoint that returns issue keys for client-side MCP fetching
export async function POST(request: Request) {
  try {
    const { issueKeys } = await request.json();

    if (!issueKeys || !Array.isArray(issueKeys)) {
      return NextResponse.json(
        { success: false, error: 'issueKeys array is required' },
        { status: 400 }
      );
    }

    // Since we can't use MCP directly in server-side code,
    // return the keys for the client to fetch using MCP
    return NextResponse.json({
      success: true,
      message: 'Use client-side MCP to fetch these issues',
      issueKeys: issueKeys,
      cloudId: '6877df8d-8ca7-4a00-b3d4-6a10b3d2f3f0',
      instructions: 'Client should use mcp__atlassian__getJiraIssue for each key'
    });

  } catch (error) {
    console.error('❌ JIRA MCP bridge error:', error);
    return NextResponse.json(
      { success: false, error: 'Bridge request failed' },
      { status: 500 }
    );
  }
}