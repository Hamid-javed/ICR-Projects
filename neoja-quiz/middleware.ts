import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  console.log("🚀 ~ middleware ~ token:", token)
  const userRole = request.cookies.get('userRole')?.value;
  console.log("🚀 ~ middleware ~ userRole:", userRole)
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  console.log("🚀 ~ middleware ~ isAdminRoute:", isAdminRoute)
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  console.log("🚀 ~ middleware ~ isLoginPage:", isLoginPage)

  // If trying to access admin routes without being logged in
  if (isAdminRoute && !isLoginPage && (!token || userRole !== 'admin')) {
    const url = new URL('/admin/login', request.url);
    return NextResponse.redirect(url);
  }

  // If logged in admin tries to access login page, redirect to admin dashboard
  if (isLoginPage && token && userRole === 'admin') {
    const url = new URL('/admin', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
  ],
}; 