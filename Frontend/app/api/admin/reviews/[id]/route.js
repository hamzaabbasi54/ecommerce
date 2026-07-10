import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// DELETE /api/admin/reviews/[id]
export async function DELETE(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error deleting review:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
