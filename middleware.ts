import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Handle auth pages
  if (pathname.startsWith('/auth/')) {
    const { data: { session } } = await supabase.auth.getSession();

    // Special handling for verification pages
    if (pathname === '/auth/check-email' || 
        pathname === '/auth/verification-success' || 
        pathname === '/auth/verification-error') {
      return response;
    }

    // If user is signed in and tries to access auth pages, redirect to dashboard
    if (session && !pathname.includes('signout')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}; 