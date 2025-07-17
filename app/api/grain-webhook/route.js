export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Received webhook data:', body);
    
    // TODO: Process the webhook data and save to Supabase
    
    return Response.json({ 
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ 
    message: 'Grain webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}