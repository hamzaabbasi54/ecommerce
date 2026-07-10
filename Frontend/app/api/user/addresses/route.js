import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    if (error instanceof Response) return error;
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { label, street, city, province, postalCode, country, isDefault } = body;

    if (!label || !street || !city || !postalCode || !country) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // If this is set to default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        label,
        street,
        city,
        province: province || '',
        postalCode,
        country,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({ success: true, data: newAddress, message: 'Address created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);
    if (error instanceof Response) return error;
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
