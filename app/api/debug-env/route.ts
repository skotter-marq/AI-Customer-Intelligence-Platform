import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get environment variables (redacted for security)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      supabase: {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...${supabaseUrl.substring(supabaseUrl.length - 10)}` : 'MISSING',
        key: supabaseKey ? `${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}` : 'MISSING',
        urlValid: supabaseUrl ? supabaseUrl.startsWith('https://') : false,
        keyValid: supabaseKey ? supabaseKey.length > 50 : false
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}