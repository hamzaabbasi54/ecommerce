import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateToken, getCookieOptions, GUEST_COOKIE_NAME } from '@/lib/auth';
import { mergeGuestIntoUser, linkGuestOrdersByEmail } from '@/lib/guestMerge';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is too short"),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role } = validationResult.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

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
      message: 'User created successfully',
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

    const response = NextResponse.json(responseBody, { status: 201 });

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
    console.error('Error in register route:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
