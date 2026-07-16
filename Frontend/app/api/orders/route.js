import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, verifyOptionalAuth, refreshGuestCookie } from '@/lib/auth';
import sendEmail from '@/lib/email';
import { orderSummaryTemplate } from '@/lib/emailTemplates';

export async function POST(request) {
  try {
    const { user, guest } = await verifyOptionalAuth(request);
    let guestCookieHeader = null;

    // Must have at least one identity to checkout
    if (!user && !guest) {
      return NextResponse.json({ success: false, message: 'Please add items to your cart first' }, { status: 401 });
    }

    // Rolling refresh for existing guest
    if (guest) {
      guestCookieHeader = await refreshGuestCookie(guest);
    }

    const body = await request.json();
    const { address, paymentMethod, email, phone, couponCode } = body;

    // Validate shipping address
    if (!address || !address.firstName || !address.lastName || !address.street || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json({ success: false, message: 'Incomplete shipping address' }, { status: 400 });
    }

    // Guest must provide an email for order confirmation
    const recipientEmail = user ? user.email : email;
    if (!recipientEmail) {
      return NextResponse.json({ success: false, message: 'Email is required for guest checkout' }, { status: 400 });
    }

    // Determine recipient name for the confirmation email
    const recipientName = user ? user.name : `${address.firstName} ${address.lastName}`;

    // 1. Fetch Cart (user or guest)
    const cartWhere = user ? { userId: user.id } : { guestId: guest.id };
    const cart = await prisma.cart.findUnique({
      where: cartWhere,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    // 2. Re-validate stock and prices at checkout time against the live database
    const itemIssues = [];
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      // Fetch the freshest product data right now
      const currentProduct = await prisma.product.findUnique({ where: { id: item.productId } });

      if (!currentProduct || currentProduct.deletedAt || !currentProduct.isActive) {
        itemIssues.push({
          productId: item.productId,
          name: item.product.name,
          reason: 'Product is no longer available',
        });
        continue;
      }

      if (currentProduct.stock < item.quantity) {
        itemIssues.push({
          productId: item.productId,
          name: currentProduct.name,
          reason: currentProduct.stock === 0
            ? 'Out of stock'
            : `Only ${currentProduct.stock} left in stock (you requested ${item.quantity})`,
        });
        continue;
      }

      const currentPrice = currentProduct.discountPrice || currentProduct.price;
      const cartPrice = item.priceAtAdd;

      if (currentPrice !== cartPrice) {
        itemIssues.push({
          productId: item.productId,
          name: currentProduct.name,
          reason: `Price changed from $${cartPrice.toFixed(2)} to $${currentPrice.toFixed(2)} since it was added to cart`,
        });
        continue;
      }

      // Item passed all checks
      subtotal += currentPrice * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: currentPrice,
      });
    }

    // If any items have issues, block the order and report all issues
    if (itemIssues.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Some items in your cart cannot be checked out',
        issues: itemIssues,
      }, { status: 400 });
    }

    // 3. Validate and calculate coupon discount (identical for user and guest)
    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: {
            equals: couponCode.trim(),
            mode: 'insensitive'
          }
        }
      });

      if (!coupon) {
        return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 400 });
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
      }

      if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
        return NextResponse.json({ success: false, message: 'This coupon has reached its usage limit' }, { status: 400 });
      }

      if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue) {
        return NextResponse.json({
          success: false,
          message: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required`
        }, { status: 400 });
      }

      if (coupon.discountType === 'percentage') {
        discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }

      couponId = coupon.id;
    }

    const shippingCharge = 0; // Free shipping
    const taxRate = 0.08; // 8% tax
    const taxableAmount = subtotal - discount;
    const tax = Number((taxableAmount * taxRate).toFixed(2));
    const total = taxableAmount + shippingCharge + tax;

    // 4. Database Transaction: Create Address, Order, OrderItems, apply coupon, decrement stock, clear Cart
    // Build the owner fields — one code path for both user and guest
    const ownerFields = user
      ? { userId: user.id }
      : { guestId: guest.id };

    const result = await prisma.$transaction(async (tx) => {
      // Create Address (linked to user or guest)
      const newAddress = await tx.address.create({
        data: {
          ...ownerFields,
          label: 'Shipping',
          street: address.street,
          city: address.city,
          province: address.province || 'N/A',
          postalCode: address.postalCode,
          country: address.country
        }
      });

      // Create Order (linked to user or guest)
      const order = await tx.order.create({
        data: {
          ...ownerFields,
          addressId: newAddress.id,
          contactEmail: recipientEmail,
          contactPhone: phone || (user ? null : null),
          subtotal,
          shippingCharge,
          tax,
          discount,
          total,
          couponId: couponId || undefined,
          paymentMethod: paymentMethod || 'cod',
          paymentStatus: 'pending',
          status: 'pending',
          items: {
            create: orderItemsData
          }
        }
      });

      // Update product stock securely against concurrency (identical for user and guest)
      for (const item of orderItemsData) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }
          },
          data: { stock: { decrement: item.quantity } }
        });

        if (updateResult.count === 0) {
          throw new Error(`Out of stock during checkout for product ID: ${item.productId}`);
        }
      }

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { timesUsed: { increment: 1 } }
        });
      }

      // Clear the Cart items (not the Guest row itself — same as user cart clearing)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return { order, address: newAddress };
    });

    // 5. Send Order Confirmation Email (identical path for user and guest)
    try {
      const itemsForEmail = cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        priceAtPurchase: item.product.discountPrice || item.product.price
      }));

      const shippingAddress = {
        name: `${address.firstName} ${address.lastName}`,
        street: address.street,
        city: address.city,
        province: address.province || '',
        postalCode: address.postalCode,
        country: address.country,
      };

      const emailHtml = orderSummaryTemplate(
        { ...result.order, items: itemsForEmail },
        { name: recipientName },
        shippingAddress
      );

      await sendEmail({
        email: recipientEmail,
        subject: `Order Confirmation - #${result.order.id.slice(-8).toUpperCase()}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Proceed returning success even if email fails
    }

    const response = NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: result.order
    }, { status: 201 });

    if (guestCookieHeader) {
      response.headers.set('Set-Cookie', guestCookieHeader);
    }
    return response;

  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Order creation error:', error);

    if (error.message && error.message.includes('Out of stock during checkout')) {
      return NextResponse.json({ success: false, message: 'One or more items went out of stock during checkout. Please review your cart.' }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all orders for this user, ordered by creation date descending
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Fetch orders error:', error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
