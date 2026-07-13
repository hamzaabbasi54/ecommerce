import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import sendEmail from '@/lib/email';
import { orderCancellationTemplate } from '@/lib/emailTemplates';

// PUT /api/orders/[id]/cancel
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Ownership check (same as GET order)
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Not authorized to cancel this order' }, { status: 403 });
    }

    // Check cancellable status
    if (order.status !== 'pending' && order.status !== 'processing') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      }, { status: 400 });
    }

    // Database Transaction: Update status, restore stock, reverse coupon usage
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // Reverse coupon usage if applicable
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { timesUsed: { decrement: 1 } }
        });
      }

      return cancelledOrder;
    });

    // Send Cancellation Email
    try {
      const emailHtml = orderCancellationTemplate(order, user);
      
      await sendEmail({
        email: user.email,
        subject: `Order Cancelled - #${order.id.slice(-8).toUpperCase()}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send order cancellation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    if (error instanceof Response) return error;
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
