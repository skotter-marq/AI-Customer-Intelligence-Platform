import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Initiate OAuth flow
export async function GET() {
  try {
    const AtlassianOAuth = require('../../../../lib/atlassian-oauth.js');
    const oauth = new AtlassianOAuth();
    
    const { url, state } = oauth.getAuthorizationUrl();
    
    // Store state in cookie for CSRF protection
    const cookieStore = cookies();
    cookieStore.set('atlassian_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });
    
    // Redirect to Atlassian OAuth
    return NextResponse.redirect(url);
    
  } catch (error) {
    console.error('❌ OAuth initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}