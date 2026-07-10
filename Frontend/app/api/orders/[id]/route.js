import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        address: true,
        items: {
          include: {
            product: {
              include: {
                brand: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Ensure the user owns the order, unless they are an ADMIN
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Not authorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Fetch order error:', error);
    
    // Check if it's our thrown auth error response
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
