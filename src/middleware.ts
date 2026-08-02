import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check path permissions against token role
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/junior') && token?.role !== 'JUNIOR' && token?.role !== 'INTERN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/dashboard') && token?.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/junior/:path*', '/dashboard/:path*'],
};
