import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// PUT /api/cart/items/:itemId
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { itemId } = await params;
    const { quantity } = await request.json();
    const requestedQuantity = parseInt(quantity);

    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid quantity' },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    if (requestedQuantity > cartItem.product.stock) {
      return NextResponse.json(
        { success: false, message: `Only ${cartItem.product.stock} items left in stock` },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: requestedQuantity },
    });

    return NextResponse.json({
      success: true,
      message: 'Cart item updated',
      data: updatedItem,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in updateCartItemQuantity:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/items/:itemId
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { itemId } = await params;

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in removeFromCart:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
