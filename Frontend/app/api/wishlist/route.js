import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/wishlist
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
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

    const existingItem = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'Product is already in your wishlist' },
        { status: 400 }
      );
    }

    await prisma.wishlist.create({
      data: { userId: user.id, productId },
    });

    return NextResponse.json({ success: true, message: 'Added to wishlist successfully' });
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
    const user = await verifyAuth(request);

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
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

    return NextResponse.json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: validItems,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in getWishlist:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
