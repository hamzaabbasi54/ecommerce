import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 1. Define Route Categories
const protectedRoutes = ['/profile', '/checkout', '/wishlist', '/orders'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const adminRoutes = ['/admin'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  let decodedToken = null;

  // 2. Verify Token if it exists
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      decodedToken = payload;
    } catch (error) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 3. Handle Guest-Only Auth Routes (Redirect logged-in users away from /login)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (decodedToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle Protected User Routes (Redirect guests to /login)
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 5. Handle Admin Routes (Redirect guests to login, non-admins to home)
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (decodedToken.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 6. Allow all other public routes (e.g. /, /products, /categories)
  return NextResponse.next();
}

// Specify exactly which paths the middleware should run on to optimize performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes are protected by helper functions instead)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
