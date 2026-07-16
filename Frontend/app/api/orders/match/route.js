import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// ─── GET /api/orders/match ──────────────────────────────────────────
// Authenticated only. Returns guest orders whose contactEmail matches
// the logged-in user's email. Does NOT modify any order.
export async function GET(request) {
  try {
    const user = await verifyAuth(request);

    // Find guest orders that match this user's email but aren't linked yet
    const matchedOrders = await prisma.order.findMany({
      where: {
        guestId: { not: null },
        userId: null,
        contactEmail: {
          equals: user.email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = matchedOrders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(-8).toUpperCase(),
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    }));

    return NextResponse.json({
      success: true,
      message: data.length > 0
        ? `Found ${data.length} order(s) that may belong to you`
        : 'No matching guest orders found',
      data,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Order match error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST /api/orders/match ─────────────────────────────────────────
// Authenticated only. Links a specific guest order to the logged-in user.
// Accepts: { orderId }
// Only links if the order's contactEmail matches and it isn't already
// linked to any user. Sets userId; keeps guestId unchanged.
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch the order — must be a guest-only order not yet linked
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId) {
      return NextResponse.json(
        { success: false, message: 'This order is already linked to an account' },
        { status: 400 }
      );
    }

    if (!order.guestId) {
      return NextResponse.json(
        { success: false, message: 'This order cannot be linked' },
        { status: 400 }
      );
    }

    // Verify the contactEmail matches
    if (
      !order.contactEmail ||
      order.contactEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, message: 'This order does not match your account email' },
        { status: 403 }
      );
    }

    // Link the order — set userId, keep guestId unchanged
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Order linked to your account successfully',
      data: {
        id: updated.id,
        orderNumber: updated.id.slice(-8).toUpperCase(),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Order link error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
