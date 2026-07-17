import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOptionalAuth, getOrCreateGuest, refreshGuestCookie } from '@/lib/auth';

// Helper function to get or create a cart for the current identity (user or guest)
const getOrCreateCart = async ({ userId, guestId }) => {
  const where = userId ? { userId } : { guestId };
  let cart = await prisma.cart.findUnique({ where });
  if (!cart) {
    cart = await prisma.cart.create({ data: where });
  }
  return cart;
};

// POST /api/cart
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

    const cartInclude = {
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
    };

    const ownerId = user ? { userId: user.id } : { guestId: guest.id };

    // Fetch product and cart simultaneously. Filter cart items to the requested product so we know if it exists.
    const [product, cart] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.cart.findUnique({
        where: ownerId,
        include: { items: { where: { productId } } },
      }),
    ]);

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

    let finalCartId = cart?.id;
    let existingCartItem = cart?.items?.[0];

    // If no cart exists at all, create it.
    if (!finalCartId) {
      const newCart = await prisma.cart.create({ data: ownerId });
      finalCartId = newCart.id;
    }

    const priceAtAdd = product.discountPrice ? product.discountPrice : product.price;
    let updatedCart;

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + requestedQuantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, message: `Cannot add more. Only ${product.stock} items total in stock` },
          { status: 400 }
        );
      }
      
      // Update item and request Prisma to fetch the fully populated cart in the same query
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity, priceAtAdd },
        include: { cart: { include: cartInclude } }
      });
      updatedCart = updatedItem.cart;
    } else {
      // Create item and request Prisma to fetch the fully populated cart in the same query
      const newItem = await prisma.cartItem.create({
        data: { cartId: finalCartId, productId, quantity: requestedQuantity, priceAtAdd },
        include: { cart: { include: cartInclude } }
      });
      updatedCart = newItem.cart;
    }

    let cartTotal = 0;
    updatedCart.items.forEach((item) => {
      cartTotal += item.priceAtAdd * item.quantity;
    });

    const response = NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { ...updatedCart, cartTotal }
    });

    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
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
    const { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    // Rolling refresh for existing guest
    if (guest) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    // No identity — return empty cart (no error)
    if (!user && !guest) {
      return NextResponse.json({
        success: true,
        message: 'Cart is empty',
        data: { items: [], cartTotal: 0 },
      });
    }

    const where = user ? { userId: user.id } : { guestId: guest.id };
    const cart = await prisma.cart.findUnique({
      where,
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
      const emptyResponse = NextResponse.json({
        success: true,
        message: 'Cart is empty',
        data: { items: [], cartTotal: 0 },
      });
      if (guestCookieHeader) {
        emptyResponse.headers.set('Set-Cookie', guestCookieHeader);
      }
      return emptyResponse;
    }

    let cartTotal = 0;
    cart.items.forEach((item) => {
      cartTotal += item.priceAtAdd * item.quantity;
    });

    const response = NextResponse.json({
      success: true,
      message: 'Cart fetched successfully',
      data: { ...cart, cartTotal },
    });
    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in getCart:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
