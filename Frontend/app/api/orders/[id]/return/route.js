import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOptionalAuth } from '@/lib/auth';
import sendEmail from '@/lib/email';

export async function POST(request, { params }) {
  try {
    const { user, guest } = await verifyOptionalAuth(request);
    if (!user && !guest) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ success: false, message: 'Reason for return is required' }, { status: 400 });
    }

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

    // Ownership check
    const isOwner = (user && order.userId === user.id) || (guest && order.guestId === guest.id);
    const isAdmin = user && user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Not authorized to return this order' }, { status: 403 });
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ 
        success: false, 
        message: `Only delivered orders can be returned. Current status: ${order.status}` 
      }, { status: 400 });
    }

    // Process return in a transaction
    const [returnRequest, updatedOrder] = await prisma.$transaction([
      prisma.returnRequest.create({
        data: {
          orderId: order.id,
          reason,
          type: 'refund',
          status: 'pending'
        }
      }),
      prisma.order.update({
        where: { id },
        data: { status: 'return_requested' }
      })
    ]);

    // Send Return Confirmation Email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto; color: #333;">
          <h2 style="color: #000;">Return Request Received</h2>
          <p>Hi,</p>
          <p>We have received your return request for Order <strong>#${order.id.slice(-8).toUpperCase()}</strong>.</p>
          <p><strong>Reason provided:</strong> ${reason}</p>
          <p>Our team will review your request and get back to you with the next steps regarding shipping and refunds.</p>
          <p>Thank you for shopping with Electronica.</p>
        </div>
      `;
      
      const recipientEmail = user?.email || order.contactEmail;

      if (recipientEmail) {
        await sendEmail({
          email: recipientEmail,
          subject: `Return Request Received - Order #${order.id.slice(-8).toUpperCase()}`,
          html: emailHtml
        });
      }
    } catch (emailError) {
      console.error('Failed to send order return email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Return order error:', error);
    if (error instanceof Response) return error;
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
