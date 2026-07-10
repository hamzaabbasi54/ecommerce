import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { address, paymentMethod, email } = body;

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

    const shippingCharge = 0; // Free shipping
    const taxRate = 0.08; // 8% tax
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = subtotal + shippingCharge + tax;

    // 3. Database Transaction: Create Address, Order, OrderItems, and clear Cart
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
          total,
          paymentMethod: paymentMethod || 'credit_card',
          paymentStatus: 'completed', // Mock payment integration
          status: 'pending',
          items: {
            create: orderItemsData
          }
        }
      });

      // Update product stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear the Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return order;
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Order created successfully', 
      data: result 
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
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
