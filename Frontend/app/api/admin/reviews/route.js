import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/reviews
export async function GET(request) {
  try {
    await verifyAdmin(request);
    
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        product: { select: { id: true, name: true, images: true } }
      }
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error fetching reviews:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
