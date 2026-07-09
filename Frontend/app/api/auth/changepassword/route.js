import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request) {
  try {
    const user = await verifyAuth(request);
    const { oldPassword, newPassword } = await request.json();

    // Fetch full user with password
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });

    const isMatch = await bcrypt.compare(oldPassword, fullUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Incorrect old password' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    // If error is a Response (thrown by verifyAuth), return it directly
    if (error instanceof Response) return error;

    console.error('Error in changePassword:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
