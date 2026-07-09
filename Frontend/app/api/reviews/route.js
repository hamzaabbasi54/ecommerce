import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/reviews
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    const { productId, rating, comment } = await request.json();
    const ratingNum = parseInt(rating);

    if (!productId || !ratingNum) {
      return NextResponse.json(
        { success: false, message: 'Product ID and rating are required' },
        { status: 400 }
      );
    }

    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product. Please edit your existing review.' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating: ratingNum,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Review added successfully', data: review },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in createReview:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
