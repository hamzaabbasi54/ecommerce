import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOptionalAuth, getOrCreateGuest, refreshGuestCookie } from '@/lib/auth';

// POST /api/wishlist
export async function POST(request) {
  try {
    let { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    // Auto-create guest on first write if no identity present
    if (!user && !guest) {
      const result = await getOrCreateGuest(request);
      guest = result.guest;
      guestCookieHeader = result.cookieHeader;
    }

    // Rolling refresh for existing guest
    if (guest && !guestCookieHeader) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt || !product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Product not found or unavailable' },
        { status: 404 }
      );
    }

    // Check for existing wishlist entry using the appropriate unique constraint
    const uniqueWhere = user
      ? { userId_productId: { userId: user.id, productId } }
      : { guestId_productId: { guestId: guest.id, productId } };

    const existingItem = await prisma.wishlist.findUnique({ where: uniqueWhere });

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'Product is already in your wishlist' },
        { status: 400 }
      );
    }

    const data = user
      ? { userId: user.id, productId }
      : { guestId: guest.id, productId };

    await prisma.wishlist.create({ data });

    const response = NextResponse.json({ success: true, message: 'Added to wishlist successfully' });
    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in addToWishlist:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET /api/wishlist
export async function GET(request) {
  try {
    const { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    // Rolling refresh for existing guest
    if (guest) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    // No identity — return empty wishlist (no error)
    if (!user && !guest) {
      const response = NextResponse.json({
        success: true,
        message: 'Wishlist fetched successfully',
        data: [],
      });
      return response;
    }

    const filterWhere = user ? { userId: user.id } : { guestId: guest.id };

    const wishlistItems = await prisma.wishlist.findMany({
      where: filterWhere,
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true,
            discountPrice: true, images: true, stock: true,
            isActive: true, deletedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const validItems = wishlistItems
      .filter((item) => item.product.deletedAt === null && item.product.isActive === true)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        addedAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          images: item.product.images,
          stock: item.product.stock,
        },
      }));

    const response = NextResponse.json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: validItems,
    });
    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in getWishlist:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
