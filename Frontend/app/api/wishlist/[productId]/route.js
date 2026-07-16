import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOptionalAuth, refreshGuestCookie } from '@/lib/auth';

// DELETE /api/wishlist/:productId
export async function DELETE(request, { params }) {
  try {
    const { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    if (!user && !guest) {
      return NextResponse.json(
        { success: false, message: 'Product not found in your wishlist' },
        { status: 404 }
      );
    }

    // Rolling refresh for existing guest
    if (guest) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    const { productId } = await params;

    const uniqueWhere = user
      ? { userId_productId: { userId: user.id, productId } }
      : { guestId_productId: { guestId: guest.id, productId } };

    const wishlistItem = await prisma.wishlist.findUnique({ where: uniqueWhere });

    if (!wishlistItem) {
      return NextResponse.json(
        { success: false, message: 'Product not found in your wishlist' },
        { status: 404 }
      );
    }

    await prisma.wishlist.delete({ where: uniqueWhere });

    const response = NextResponse.json({ success: true, message: 'Removed from wishlist' });
    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in removeFromWishlist:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
