export async function GET() {
  return Response.json({ 
    status: 'Webhook test endpoint working',
    timestamp: new Date().toISOString(),
    env_check: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      anthropic_key: process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING',
      base_url: process.env.NEXT_PUBLIC_BASE_URL ? 'SET' : 'MISSING'
    }
  });
}

export async function POST(request) {
  try {
    const data = await request.json();
    return Response.json({
      success: true,
      message: 'Test webhook received data',
      received_keys: Object.keys(data),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      error: 'Failed to parse JSON',
      message: error.message
    }, { status: 400 });
  }
}