import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, data: userProfile });
  } catch (error) {
    console.error('Fetch profile error:', error);
    if (error instanceof Response) return error;
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let name, phone, profileImage;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      phone = formData.get('phone');
      const file = formData.get('profileImage');
      
      if (file && typeof file === 'object' && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const ext = path.extname(file.name) || '.png';
        const filename = `${user.id}-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, filename);
        
        await fs.writeFile(filePath, buffer);
        profileImage = `/uploads/avatars/${filename}`;
      } else {
        profileImage = formData.get('profileImageString');
      }
    } else {
      const body = await request.json();
      name = body.name;
      phone = body.phone;
      profileImage = body.profileImage;
    }

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: 'Name and Phone are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone,
        profileImage: profileImage || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true
      }
    });

    return NextResponse.json({ success: true, data: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof Response) return error;
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
