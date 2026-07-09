import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

// PUT /api/users/profile/image
export async function PUT(request) {
  try {
    const user = await verifyAuth(request);

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    const imageUrl = await saveUploadedFile(file, 'profiles');

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        name: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in uploadProfileImage:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
