import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// ─── POST /api/orders/claim ─────────────────────────────────────────
// Authenticated only. Accepts { orderId, email?, phone? }.
// Reuses the same contact-matching logic as /api/orders/lookup.
// If matched, sets userId on that order while keeping guestId unchanged.
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    const { orderId, email, phone } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required to verify the order' },
        { status: 400 }
      );
    }

    // Generic error — same pattern as /api/orders/lookup
    const notFoundResponse = NextResponse.json(
      { success: false, message: 'Order not found or contact details do not match' },
      { status: 404 }
    );

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, phone: true } },
      },
    });

    if (!order) {
      return notFoundResponse;
    }

    // Already linked to a user account
    if (order.userId) {
      if (order.userId === user.id) {
        return NextResponse.json(
          { success: false, message: 'This order is already linked to your account' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'This order is already linked to another account' },
        { status: 400 }
      );
    }

    // Verify contact info — same logic as /api/orders/lookup/route.js
    const orderEmail = order.contactEmail || order.user?.email || null;
    const orderPhone = order.contactPhone || order.user?.phone || null;

    let contactMatched = false;

    if (email && orderEmail) {
      contactMatched = email.trim().toLowerCase() === orderEmail.trim().toLowerCase();
    }

    if (!contactMatched && phone && orderPhone) {
      const normalizePhone = (p) => p.replace(/\D/g, '');
      contactMatched = normalizePhone(phone) === normalizePhone(orderPhone);
    }

    if (!contactMatched) {
      return notFoundResponse;
    }

    // Link the order — set userId, keep guestId unchanged
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Order claimed and linked to your account successfully',
      data: {
        id: updated.id,
        orderNumber: updated.id.slice(-8).toUpperCase(),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Order claim error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
