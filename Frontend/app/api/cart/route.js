import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// Helper function to get or create a cart for the logged-in user
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
};

// POST /api/cart
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    const { productId, quantity } = await request.json();
    const requestedQuantity = parseInt(quantity) || 1;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (requestedQuantity <= 0) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be greater than 0' },
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

    if (product.stock < requestedQuantity) {
      return NextResponse.json(
        { success: false, message: `Only ${product.stock} items left in stock` },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(user.id);

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const priceAtAdd = product.discountPrice ? product.discountPrice : product.price;

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + requestedQuantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, message: `Cannot add more. Only ${product.stock} items total in stock` },
          { status: 400 }
        );
      }
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity, priceAtAdd },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: requestedQuantity, priceAtAdd },
      });
    }

    return NextResponse.json({ success: true, message: 'Item added to cart successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in addToCart:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET /api/cart
export async function GET(request) {
  try {
    const user = await verifyAuth(request);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, price: true,
                discountPrice: true, images: true, stock: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: 'Cart is empty',
        data: { items: [], cartTotal: 0 },
      });
    }

    let cartTotal = 0;
    cart.items.forEach((item) => {
      cartTotal += item.priceAtAdd * item.quantity;
    });

    return NextResponse.json({
      success: true,
      message: 'Cart fetched successfully',
      data: { ...cart, cartTotal },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in getCart:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
