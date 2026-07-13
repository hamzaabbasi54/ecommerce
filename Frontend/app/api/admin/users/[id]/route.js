import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// DELETE /api/admin/users/[id]
export async function DELETE(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prevent deleting yourself (admin self-deletion)
    // Extract current user from the request cookie
    const { cookies } = require('next/headers');
    const jwt = require('jsonwebtoken');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === id) {
          return NextResponse.json({ success: false, message: 'You cannot delete your own account' }, { status: 400 });
        }
      } catch (e) {
        // Token verification failed, continue with deletion
      }
    }

    // Delete user — cascading deletes will handle related records (addresses, orders, reviews, cart, wishlist)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error deleting user:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
