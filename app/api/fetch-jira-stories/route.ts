import { NextResponse } from 'next/server';

// Simple endpoint that tells the client which stories to fetch via MCP
export async function POST(request: Request) {
  try {
    const { issueKeys } = await request.json();

    if (!issueKeys || !Array.isArray(issueKeys)) {
      return NextResponse.json(
        { success: false, error: 'issueKeys array is required' },
        { status: 400 }
      );
    }

    // Return success with instructions for client-side MCP usage
    return NextResponse.json({
      success: true,
      message: 'Ready for MCP fetching',
      cloudId: '6877df8d-8ca7-4a00-b3d4-6a10b3d2f3f0',
      issueKeys: issueKeys,
      mcpFunction: 'mcp__atlassian__getJiraIssue'
    });

  } catch (error) {
    console.error('❌ Fetch JIRA stories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to prepare JIRA fetch' },
      { status: 500 }
    );
  }
}