export async function GET() {
  return Response.json({ 
    message: 'Test endpoint working!',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'
  });
}