import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/orders
export async function GET(request) {
  try {
    await verifyAdmin(request);
    
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        guest: { select: { id: true } },
        address: true,
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } }
          }
        },
        returnRequests: {
          orderBy: { createdAt: 'desc' },
        },
      }
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error fetching orders:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/orders (update status)
export async function PUT(request) {
  try {
    await verifyAdmin(request);
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'Order ID and Status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    // Auto-set deliveredAt when marking as delivered
    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        guest: { select: { id: true } },
        address: true,
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } }
          }
        },
        returnRequests: {
          orderBy: { createdAt: 'desc' },
        },
      }
    });

    return NextResponse.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error updating order status:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
