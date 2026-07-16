import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRefundEligibility } from '@/lib/order';

// ─── In-Memory Rate Limiter (shared pattern with lookup) ────────────
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;            // stricter limit for return requests
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { windowStart: now, count: 1 };
    rateLimitMap.set(ip, record);
    return false;
  }

  record.count++;
  return record.count > MAX_REQUESTS;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now - record.windowStart > WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ─── POST /api/orders/[id]/return ───────────────────────────────────
// Public endpoint — no authentication required.
// Accepts: { email, phone, type, reason }
//   type: "refund" or "exchange"
//   email or phone: must match the order's contact info (same verification as lookup)
export async function POST(request, { params }) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { email, phone, type, reason } = body;

    // Validate inputs
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required to verify your identity' },
        { status: 400 }
      );
    }

    if (!type || !['refund', 'exchange'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Type must be "refund" or "exchange"' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a reason (at least 10 characters)' },
        { status: 400 }
      );
    }

    // Generic error — never reveal if the order ID exists
    const notFoundResponse = NextResponse.json(
      { success: false, message: 'Order not found or contact details do not match' },
      { status: 404 }
    );

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true } },
      },
    });

    if (!order) {
      return notFoundResponse;
    }

    // Verify contact info (same logic as lookup)
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

    // Check eligibility using the shared function
    const eligibility = checkRefundEligibility(order);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, message: eligibility.reason },
        { status: 400 }
      );
    }

    // Check if there's already a pending return request for this order
    const existingRequest = await prisma.returnRequest.findFirst({
      where: {
        orderId: id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: 'A return request is already pending for this order' },
        { status: 400 }
      );
    }

    // Create the return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: id,
        type,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} request submitted successfully`,
      data: {
        id: returnRequest.id,
        type: returnRequest.type,
        reason: returnRequest.reason,
        status: returnRequest.status,
        createdAt: returnRequest.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
