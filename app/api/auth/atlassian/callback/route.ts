import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(new URL('/?oauth_error=' + error, request.url));
    }
    
    if (!code || !state) {
      return NextResponse.redirect(new URL('/?oauth_error=missing_parameters', request.url));
    }
    
    // Verify state for CSRF protection
    const cookieStore = cookies();
    const storedState = cookieStore.get('atlassian_oauth_state')?.value;
    
    if (!storedState || storedState !== state) {
      console.error('❌ OAuth state mismatch');
      return NextResponse.redirect(new URL('/?oauth_error=state_mismatch', request.url));
    }
    
    // Exchange code for tokens
    const AtlassianOAuth = require('../../../../../lib/atlassian-oauth.js');
    const oauth = new AtlassianOAuth();
    
    const tokenResult = await oauth.exchangeCodeForToken(code);
    
    if (!tokenResult.success) {
      console.error('❌ Token exchange failed:', tokenResult.error);
      return NextResponse.redirect(new URL('/?oauth_error=token_exchange_failed', request.url));
    }
    
    // Get accessible resources
    const resourcesResult = await oauth.getAccessibleResources(tokenResult.tokens.access_token);
    
    if (!resourcesResult.success) {
      console.error('❌ Failed to get resources:', resourcesResult.error);
      return NextResponse.redirect(new URL('/?oauth_error=resource_access_failed', request.url));
    }
    
    // Store tokens in Supabase (secure storage)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error: dbError } = await supabase
      .from('atlassian_tokens')
      .upsert({
        user_id: 'system', // You might want to associate with actual user
        access_token: tokenResult.tokens.access_token,
        refresh_token: tokenResult.tokens.refresh_token,
        expires_at: new Date(Date.now() + tokenResult.tokens.expires_in * 1000),
        scope: tokenResult.tokens.scope,
        resources: resourcesResult.resources,
        created_at: new Date(),
        updated_at: new Date()
      });
    
    if (dbError) {
      console.error('❌ Failed to store tokens:', dbError);
      return NextResponse.redirect(new URL('/?oauth_error=storage_failed', request.url));
    }
    
    // Clear state cookie
    cookieStore.delete('atlassian_oauth_state');
    
    // Redirect to success page
    return NextResponse.redirect(new URL('/?oauth_success=true', request.url));
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?oauth_error=callback_failed', request.url));
  }
}