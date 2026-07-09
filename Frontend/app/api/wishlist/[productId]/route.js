import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// DELETE /api/wishlist/:productId
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { productId } = await params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { success: false, message: 'Product not found in your wishlist' },
        { status: 404 }
      );
    }

    await prisma.wishlist.delete({
      where: { userId_productId: { userId: user.id, productId } },
    });

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in removeFromWishlist:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
