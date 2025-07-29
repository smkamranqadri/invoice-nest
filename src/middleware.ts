import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthError } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/setup',
    '/api/auth/setup/status',
    '/api/auth/login',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For API routes, check authentication
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(token);
      
      // Add user info to request headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  // For page routes, redirect to login if not authenticated
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Check if setup is needed
    if (pathname === '/setup') {
      return NextResponse.next();
    }
    
    // Redirect to setup or login
    const setupUrl = new URL('/setup', request.url);
    return NextResponse.redirect(setupUrl);
  }

  try {
    const payload = verifyToken(token);
    
    // If user is authenticated and trying to access setup page, redirect to dashboard
    if (pathname === '/setup') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/setup', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 