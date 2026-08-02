import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // SENIOR attempt on /admin or /junior -> redirect to /senior/dashboard
    if (path.startsWith('/admin')) {
      if (token?.role === 'SENIOR') {
        return NextResponse.redirect(new URL('/senior/dashboard', req.url));
      }
      if (token?.role === 'JUNIOR' || token?.role === 'INTERN') {
        return NextResponse.redirect(new URL('/junior/dashboard', req.url));
      }
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (path.startsWith('/junior')) {
      if (token?.role === 'SENIOR') {
        return NextResponse.redirect(new URL('/senior/dashboard', req.url));
      }
      if (token?.role !== 'JUNIOR' && token?.role !== 'INTERN' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (path.startsWith('/senior')) {
      if (token?.role !== 'SENIOR' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
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
  matcher: ['/admin/:path*', '/junior/:path*', '/senior/:path*', '/dashboard/:path*'],
};
