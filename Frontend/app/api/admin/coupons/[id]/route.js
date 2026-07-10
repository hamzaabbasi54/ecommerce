import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

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
