import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// PUT /api/reviews/:reviewId
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { reviewId } = await params;
    const { rating, comment } = await request.json();

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to edit this review' },
        { status: 403 }
      );
    }

    let ratingNum;
    if (rating) {
      ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return NextResponse.json(
          { success: false, message: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(ratingNum && { rating: ratingNum }),
        ...(comment !== undefined && { comment: comment || null }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in updateReview:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/:reviewId
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { reviewId } = await params;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in deleteReview:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
