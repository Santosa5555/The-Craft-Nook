// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // === ADMIN ROUTES ===
    if (pathname.startsWith('/dashboard')) {
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
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/cart/:path*', '/orders/:path*'],
};