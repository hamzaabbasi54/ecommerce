import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

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
