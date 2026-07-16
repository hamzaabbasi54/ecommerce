import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateToken, getCookieOptions, GUEST_COOKIE_NAME } from '@/lib/auth';
import { mergeGuestIntoUser, linkGuestOrdersByEmail } from '@/lib/guestMerge';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // ─── Guest → User merge ─────────────────────────────────────────
    let mergeResult = null;
    const guestToken = request.cookies.get(GUEST_COOKIE_NAME)?.value;

    if (guestToken) {
      const guest = await prisma.guest.findUnique({
        where: { token: guestToken },
      });

      if (guest && guest.expiresAt > new Date()) {
        mergeResult = await mergeGuestIntoUser(user.id, guest.id);
      }
    }

    // ─── Phase 4: Retroactive Order Claiming ────────────────────────
    let linkedOrdersCount = await linkGuestOrdersByEmail(user.id, user.email);

    // ─── Build response ─────────────────────────────────────────────
    const token = generateToken(user.id, user.role);
    const cookieOptions = getCookieOptions();

    const responseBody = {
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    if (mergeResult || linkedOrdersCount > 0) {
      responseBody.merge = {
        cartItemsSkipped: mergeResult?.skippedCartItems || [],
        wishlistItemsSkipped: mergeResult?.skippedWishlistItems || [],
        ordersClaimed: linkedOrdersCount,
      };
    }

    const response = NextResponse.json(responseBody);

    // Set the user auth token
    response.cookies.set('token', token, cookieOptions);

    // Clear the guest cookie (same expiry pattern as logout)
    if (guestToken) {
      response.cookies.set(GUEST_COOKIE_NAME, '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error in login route:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
