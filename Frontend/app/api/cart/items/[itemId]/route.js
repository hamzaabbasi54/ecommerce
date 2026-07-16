import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOptionalAuth, refreshGuestCookie } from '@/lib/auth';

// PUT /api/cart/items/:itemId
export async function PUT(request, { params }) {
  try {
    const { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    if (!user && !guest) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Rolling refresh for existing guest
    if (guest) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    const { itemId } = await params;
    const { quantity } = await request.json();
    const requestedQuantity = parseInt(quantity);

    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid quantity' },
        { status: 400 }
      );
    }

    const where = user ? { userId: user.id } : { guestId: guest.id };
    const cart = await prisma.cart.findUnique({ where });
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

    const response = NextResponse.json({
      success: true,
      message: 'Cart item updated',
      data: updatedItem,
    });
    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
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
    const { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    if (!user && !guest) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Rolling refresh for existing guest
    if (guest) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    const { itemId } = await params;

    const where = user ? { userId: user.id } : { guestId: guest.id };
    const cart = await prisma.cart.findUnique({ where });
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

    const response = NextResponse.json({ success: true, message: 'Item removed from cart' });
    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in removeFromCart:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
