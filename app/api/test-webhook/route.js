export async function GET() {
  return Response.json({ 
    status: 'Test webhook working',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return Response.json({ 
    status: 'POST working',
    timestamp: new Date().toISOString()
  });
}