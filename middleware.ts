import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // For now, let's disable middleware authentication and rely on client-side auth
  // This simplifies the setup while keeping functionality
  
  // Only handle login page redirects
  if (req.nextUrl.pathname === '/login') {
    // If someone is accessing login, let them through
    return NextResponse.next();
  }

  // Let all other routes through - AuthGuard component will handle protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};