import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import sendEmail from '@/lib/email';
import { orderSummaryTemplate } from '@/lib/emailTemplates';

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { address, paymentMethod, email, couponCode } = body;

    if (!address || !address.firstName || !address.lastName || !address.street || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json({ success: false, message: 'Incomplete shipping address' }, { status: 400 });
    }

    // 1. Fetch User's Cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    // 2. Calculate Totals
    let subtotal = 0;
    const orderItemsData = [];
    
    for (const item of cart.items) {
      // Validate stock
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Product ${item.product.name} is out of stock (only ${item.product.stock} available)` 
        }, { status: 400 });
      }

      const price = item.product.discountPrice || item.product.price;
      subtotal += price * item.quantity;
      
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: price
      });
    }

    // 3. Validate and calculate coupon discount
    let discount = 0;
    let couponId = null;
    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
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

      // Check expiry
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
      }

      // Check usage limit
      if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
        return NextResponse.json({ success: false, message: 'This coupon has reached its usage limit' }, { status: 400 });
      }

      // Check minimum order value
      if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue) {
        return NextResponse.json({
          success: false,
          message: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required`
        }, { status: 400 });
      }

      // Calculate discount
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

    // 4. Database Transaction: Create Address, Order, OrderItems, apply coupon, and clear Cart
    const result = await prisma.$transaction(async (tx) => {
      // Create Address
      const newAddress = await tx.address.create({
        data: {
          userId: user.id,
          label: 'Shipping',
          street: address.street,
          city: address.city,
          province: address.province || 'N/A',
          postalCode: address.postalCode,
          country: address.country
        }
      });

      // Create Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: newAddress.id,
          subtotal,
          shippingCharge,
          tax,
          discount,
          total,
          couponId: couponId || undefined,
          paymentMethod: paymentMethod || 'cod',
          paymentStatus: 'pending', // COD - payment on delivery
          status: 'pending',
          items: {
            create: orderItemsData
          }
        }
      });

      // Update product stock securely against concurrency
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

      // Clear the Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return order;
    });

    // 5. Send Order Confirmation Email
    try {
      const itemsForEmail = cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        priceAtPurchase: item.product.discountPrice || item.product.price
      }));
      
      const emailHtml = orderSummaryTemplate({ ...result, items: itemsForEmail }, user);
      
      await sendEmail({
        email: user.email,
        subject: `Order Confirmation - #${result.id.slice(-8).toUpperCase()}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Proceed returning success even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order created successfully', 
      data: result 
    }, { status: 201 });

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
