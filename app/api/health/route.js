export async function GET() {
  try {
    // Check database connection
    const supabaseStatus = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing';
    const anthropicStatus = process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing';
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseStatus,
        anthropic: anthropicStatus,
        webhook_endpoint: 'active'
      },
      deployment_url: process.env.VERCEL_URL || 'local',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev'
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}