import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
    }

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid subtotal' }, { status: 400 });
    }

    // Look up coupon by code (case-insensitive)
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: code.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    // Check minimum order value
    if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        success: false,
        message: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required to use this coupon`
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else {
      // fixed amount
      discountAmount = Math.min(coupon.discountValue, subtotal); // Don't exceed subtotal
    }

    return NextResponse.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
