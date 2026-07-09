import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Convert the secret to a Uint8Array as required by jose
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(request) {
  // 1. Read the token cookie from the incoming request
  const token = request.cookies.get('token')?.value;

  // 2. If no token is found, redirect immediately to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 3. Verify the token using jose (Edge-compatible)
    const { payload } = await jwtVerify(token, secret);

    // 4. Check if the authenticated user has the 'ADMIN' role
    if (payload.role !== 'ADMIN') {
      // If they are a normal user, redirect them
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 5. If verification passes and they are an admin, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // Verification failed (token is tampered, expired, or invalid)
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 6. Protect ONLY the routes under /admin
export const config = {
  matcher: ['/admin/:path*'],
};
