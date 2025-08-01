import { NextResponse } from 'next/server';

// Simple proxy endpoint to get JIRA issue details
// This will be called from the frontend which has MCP access
export async function POST(request: Request) {
  try {
    const { issueKey } = await request.json();

    if (!issueKey) {
      return NextResponse.json(
        { success: false, error: 'Issue key is required' },
        { status: 400 }
      );
    }

    // Return a simple response that indicates the client should handle the JIRA fetch
    // The client will use MCP integration to get the actual data
    return NextResponse.json({
      success: true,
      message: 'Use MCP integration on client side',
      issueKey: issueKey
    });

  } catch (error) {
    console.error('❌ JIRA proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'JIRA proxy failed' },
      { status: 500 }
    );
  }
}