import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/users/addresses
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    const { label, street, city, province, postalCode, country, isDefault } = await request.json();

    if (!label || !street || !city || !province || !postalCode || !country) {
      return NextResponse.json(
        { success: false, message: 'All address fields are required' },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        label,
        street,
        city,
        province,
        postalCode,
        country,
        isDefault: isDefault || false,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Address added successfully', data: address },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in addAddress:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET /api/users/addresses
export async function GET(request) {
  try {
    const user = await verifyAuth(request);

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Addresses fetched successfully',
      data: addresses,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in getAddresses:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
