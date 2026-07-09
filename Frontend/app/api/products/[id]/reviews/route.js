import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/:id/reviews
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Reviews fetched successfully',
      data: reviews,
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
