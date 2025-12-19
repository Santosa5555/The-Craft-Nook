// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // === HOMEPAGE: Redirect admin users to dashboard ===
    if (pathname === '/') {
      if (token && token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      // Allow non-admin users and guests to access homepage
      return NextResponse.next();
    }

    // === ADMIN ROUTES ===
    // Protect admin dashboard and other admin routes (but allow /admin login page)
    if (
      pathname.startsWith('/admin/dashboard') ||
      (pathname.startsWith('/admin/') && pathname !== '/admin')
    ) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // === CUSTOMER PROTECTED ROUTES ===
    if (pathname.startsWith('/cart') || pathname.startsWith('/orders')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For homepage, allow access (we handle redirect logic above)
        if (req.nextUrl.pathname === '/') {
          return true;
        }
        // For protected routes, require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/admin/:path*', '/cart/:path*', '/orders/:path*'],
};
