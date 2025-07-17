export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Webhook is working!',
    timestamp: new Date().toISOString(),
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}
