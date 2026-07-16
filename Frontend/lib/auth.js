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

// ─── Guest-User Support ──────────────────────────────────────────────

export const GUEST_COOKIE_NAME = 'guest_token';
const GUEST_EXPIRY_DAYS = 180;

/**
 * Build a Set-Cookie header value for the guest token.
 * @param {string} token - The guest token value.
 * @param {number} maxAgeSeconds - Max-Age in seconds.
 * @returns {string} The complete Set-Cookie header value.
 */
function buildGuestCookieHeader(token, maxAgeSeconds) {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${GUEST_COOKIE_NAME}=${token}`,
    'HttpOnly',
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'SameSite=Lax',
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Try to authenticate as a logged-in user first; if that fails,
 * check for a valid guest cookie instead. Never throws — returns
 * { user, guest } where at most one is non-null.
 *
 * @param {Request} request - The incoming Next.js Request object.
 * @returns {Promise<{ user: Object|null, guest: Object|null }>}
 */
export async function verifyOptionalAuth(request) {
  // 1. Try JWT-based user auth (the existing path)
  try {
    const user = await verifyAuth(request);
    return { user, guest: null };
  } catch {
    // Not a logged-in user — continue to guest check
  }

  // 2. Try guest cookie
  const guestToken = request.cookies.get(GUEST_COOKIE_NAME)?.value;
  if (guestToken) {
    const guest = await prisma.guest.findUnique({
      where: { token: guestToken },
    });
    if (guest && guest.expiresAt > new Date()) {
      return { user: null, guest };
    }
  }

  // 3. Neither — anonymous visitor
  return { user: null, guest: null };
}

/**
 * Get an existing guest from the cookie, or create a new one.
 * Called only on write operations (add-to-cart, add-to-wishlist)
 * when no user and no valid guest cookie is present.
 *
 * @param {Request} request - The incoming Next.js Request object.
 * @returns {Promise<{ guest: Object, cookieHeader: string }>}
 */
export async function getOrCreateGuest(request) {
  const guestToken = request.cookies.get(GUEST_COOKIE_NAME)?.value;

  // Check if existing cookie maps to a valid guest
  if (guestToken) {
    const existing = await prisma.guest.findUnique({
      where: { token: guestToken },
    });
    if (existing && existing.expiresAt > new Date()) {
      const cookieHeader = buildGuestCookieHeader(
        existing.token,
        GUEST_EXPIRY_DAYS * 24 * 60 * 60
      );
      return { guest: existing, cookieHeader };
    }
  }

  // Create a brand-new guest
  const token = crypto.randomUUID();
  const maxAgeSeconds = GUEST_EXPIRY_DAYS * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  const guest = await prisma.guest.create({
    data: { token, expiresAt },
  });

  const cookieHeader = buildGuestCookieHeader(token, maxAgeSeconds);
  return { guest, cookieHeader };
}

/**
 * Rolling expiration: update the guest's lastSeenAt and expiresAt,
 * and return a fresh Set-Cookie header to re-issue the cookie.
 *
 * @param {Object} guest - The Guest object from the database.
 * @returns {Promise<string>} The Set-Cookie header value.
 */
export async function refreshGuestCookie(guest) {
  const maxAgeSeconds = GUEST_EXPIRY_DAYS * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  await prisma.guest.update({
    where: { id: guest.id },
    data: { lastSeenAt: new Date(), expiresAt },
  });

  return buildGuestCookieHeader(guest.token, maxAgeSeconds);
}
