import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// PUT /api/admin/coupons/[id]
export async function PUT(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit } = body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== coupon.code) {
      const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 409 });
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      }
    });

    return NextResponse.json({ success: true, message: 'Coupon updated successfully', data: updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error updating coupon:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error deleting coupon:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
