import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Unsubscribe Link</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Invalid Unsubscribe Link</h1>
          <p>The unsubscribe link you clicked is invalid or has expired.</p>
          <p><a href="/public-changelog">Return to Marq Updates</a></p>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Find and unsubscribe the user
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !subscriber) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe Link Not Found</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Unsubscribe Link Not Found</h1>
          <p>This unsubscribe link is not valid or has already been used.</p>
          <p><a href="/public-changelog">Return to Marq Updates</a></p>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 404
      });
    }

    // Update subscriber to inactive
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token);

    if (updateError) {
      console.error('Error unsubscribing user:', updateError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe Error</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Unsubscribe Error</h1>
          <p>There was an error processing your unsubscribe request. Please try again.</p>
          <p><a href="/public-changelog">Return to Marq Updates</a></p>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 500
      });
    }

    // Success page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Successfully Unsubscribed</title>
        <style>
          body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { color: #059669; }
          .logo { font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">marq</div>
          <h1 class="success">✓ Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from Marq product update emails.</p>
          <p>You can still view our latest updates anytime by visiting our changelog.</p>
          <p><a href="/public-changelog" style="color: #3b82f6; text-decoration: none;">View Latest Updates</a></p>
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you unsubscribed by mistake, you can always resubscribe on our changelog page.
          </p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <style>
          body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1 class="error">Unsubscribe Error</h1>
        <p>There was an error processing your request. Please try again later.</p>
        <p><a href="/public-changelog">Return to Marq Updates</a></p>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    });
  }
}