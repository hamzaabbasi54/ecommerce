import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/users/[id]
export async function GET(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Get total spent
    const orders = await prisma.order.findMany({
      where: { userId: id, status: { not: 'CANCELLED' } },
      select: { total: true }
    });
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({ success: true, user: { ...user, totalSpent } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error fetching user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/admin/users/[id]
export async function PUT(request, props) {
  try {
    const params = await props.params;
    const admin = await verifyAdmin(request);
    const { id } = params;
    
    const body = await request.json();
    const { name, email, phone, role, isVerified } = body;

    // Prevent removing your own admin status
    if (admin.id === id && role && role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'You cannot remove your own admin privileges' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role,
        isVerified
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(request, props) {
  try {
    const params = await props.params;
    const admin = await verifyAdmin(request);
    const { id } = params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prevent deleting yourself (admin self-deletion)
    if (admin.id === id) {
      return NextResponse.json({ success: false, message: 'You cannot delete your own account' }, { status: 400 });
    }

    // Use a transaction to delete all related records in the correct order
    await prisma.$transaction(async (tx) => {
      // Delete order items first (they reference both orders and products)
      await tx.orderitem.deleteMany({ where: { order: { userId: id } } });

      // Delete orders (they reference addresses which will also be deleted)
      await tx.order.deleteMany({ where: { userId: id } });

      // Delete reviews
      await tx.review.deleteMany({ where: { userId: id } });

      // Delete wishlist items
      await tx.wishlist.deleteMany({ where: { userId: id } });

      // Delete cart items, then cart
      const cart = await tx.cart.findUnique({ where: { userId: id } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.delete({ where: { id: cart.id } });
      }

      // Delete addresses
      await tx.address.deleteMany({ where: { userId: id } });

      // Finally, delete the user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error deleting user:', error.message);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
