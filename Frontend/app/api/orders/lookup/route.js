import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRefundEligibility } from '@/lib/order';

// ─── In-Memory Rate Limiter ─────────────────────────────────────────
// Keyed by IP, sliding window of MAX_REQUESTS per WINDOW_MS
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;           // max attempts per window
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    // Start a new window
    record = { windowStart: now, count: 1 };
    rateLimitMap.set(ip, record);
    return false;
  }

  record.count++;
  if (record.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

// Periodic cleanup of stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now - record.windowStart > WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ─── POST /api/orders/lookup ────────────────────────────────────────
// Public endpoint — no authentication, no cookies required.
// Accepts: { orderId, email } or { orderId, phone }
// Returns order details only if the contact info matches.
export async function POST(request) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many lookup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { orderId, email, phone } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order number is required' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required to look up an order' },
        { status: 400 }
      );
    }

    // Generic error message — never reveal if the order ID exists when contact doesn't match
    const notFoundResponse = NextResponse.json(
      { success: false, message: 'Order not found or contact details do not match' },
      { status: 404 }
    );

    // Clean up the input in case they typed '#' from the email
    const cleanOrderId = orderId.trim().replace('#', '').toLowerCase();

    // Fetch the order with all related data
    let order;
    
    // If it's a short order number (like go037806), search by endsWith
    if (cleanOrderId.length <= 10) {
      order = await prisma.order.findFirst({
        where: { id: { endsWith: cleanOrderId } },
        include: {
          user: { select: { email: true, phone: true, name: true } },
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                }
              }
            }
          },
          returnRequests: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } else {
      // Otherwise assume it's the full CUID
      order = await prisma.order.findUnique({
        where: { id: cleanOrderId },
        include: {
          user: { select: { email: true, phone: true, name: true } },
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                }
              }
            }
          },
          returnRequests: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!order) {
      return notFoundResponse;
    }

    // Verify contact info matches
    // The order stores contactEmail/contactPhone directly.
    // For user orders that pre-date the contactEmail field, fall back to user.email / user.phone.
    const orderEmail = order.contactEmail || order.user?.email || null;
    const orderPhone = order.contactPhone || order.user?.phone || null;

    let contactMatched = false;

    if (email && orderEmail) {
      contactMatched = email.trim().toLowerCase() === orderEmail.trim().toLowerCase();
    }

    if (!contactMatched && phone && orderPhone) {
      // Normalize by stripping all non-digit characters for comparison
      const normalizePhone = (p) => p.replace(/\D/g, '');
      contactMatched = normalizePhone(phone) === normalizePhone(orderPhone);
    }

    if (!contactMatched) {
      return notFoundResponse;
    }

    // Check refund/exchange eligibility
    const returnEligibility = checkRefundEligibility(order);

    // Build the public-safe response (don't leak internal IDs like userId/guestId)
    const responseData = {
      id: order.id,
      orderNumber: order.id.slice(-8).toUpperCase(),
      status: order.status,
      deliveredAt: order.deliveredAt,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      address: {
        street: order.address.street,
        city: order.address.city,
        province: order.address.province,
        postalCode: order.address.postalCode,
        country: order.address.country,
      },
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        product: item.product,
      })),
      returnRequests: order.returnRequests.map(rr => ({
        id: rr.id,
        type: rr.type,
        reason: rr.reason,
        status: rr.status,
        createdAt: rr.createdAt,
      })),
      returnEligibility,
    };

    return NextResponse.json({
      success: true,
      message: 'Order found',
      data: responseData,
    });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
