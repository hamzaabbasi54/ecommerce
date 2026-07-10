import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/coupons
export async function GET(request) {
  try {
    await verifyAdmin(request);
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error fetching coupons:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/coupons
export async function POST(request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ success: false, message: 'Code, discount type, and value are required' }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      }
    });

    return NextResponse.json({ success: true, message: 'Coupon created successfully', data: coupon }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error creating coupon:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
