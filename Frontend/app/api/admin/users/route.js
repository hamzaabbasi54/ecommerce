import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/users
export async function GET(request) {
  try {
    await verifyAdmin(request);
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isVerified: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error fetching users:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/users (update role)
export async function PUT(request) {
  try {
    await verifyAdmin(request);
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: 'User ID and Role are required' }, { status: 400 });
    }

    if (role !== 'ADMIN' && role !== 'USER') {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isVerified: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'User role updated', data: user });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error updating user role:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
