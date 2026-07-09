import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

/**
 * Generate a JWT token containing the user's ID and role.
 * Returns the token string — the caller (route handler) is responsible
 * for attaching it as a cookie on the Response.
 */
export function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
}

/**
 * Build cookie options consistent with the old Express implementation.
 */
export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60, // 1 day in seconds (Next.js uses seconds, not ms)
    path: '/',
  };
}

/**
 * Verify the JWT from the request cookies and return the authenticated user.
 * Replaces the Express `protect` middleware.
 *
 * @param {Request} request - The incoming Next.js Request object.
 * @returns {Object} The authenticated user object.
 * @throws {Response} A 401 JSON response if authentication fails.
 */
export async function verifyAuth(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    throw Response.json(
      { success: false, message: 'Not authorized, no token provided' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw Response.json(
        { success: false, message: 'Not authorized, user not found' },
        { status: 401 }
      );
    }

    return user;
  } catch (error) {
    // If it's already a Response we threw above, re-throw it
    if (error instanceof Response) throw error;

    throw Response.json(
      { success: false, message: 'Not authorized, token failed' },
      { status: 401 }
    );
  }
}

/**
 * Verify the JWT AND check that the user has the ADMIN role.
 * Replaces the Express `protect` + `admin` middleware chain.
 *
 * @param {Request} request
 * @returns {Object} The authenticated admin user object.
 * @throws {Response} A 401 or 403 JSON response.
 */
export async function verifyAdmin(request) {
  const user = await verifyAuth(request);

  if (user.role !== 'ADMIN') {
    throw Response.json(
      { success: false, message: 'Not authorized as an admin' },
      { status: 403 }
    );
  }

  return user;
}
