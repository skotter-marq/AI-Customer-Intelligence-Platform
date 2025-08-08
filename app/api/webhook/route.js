// Generic webhook endpoint that redirects to the correct handler
export async function GET(request) {
  return Response.redirect(new URL('/api/grain-webhook', request.url));
}

export async function POST(request) {
  // Forward the request to the grain webhook
  const url = new URL('/api/grain-webhook', request.url);
  const body = await request.text();
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(request.headers)
    },
    body: body
  });
  
  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: response.headers
  });
}