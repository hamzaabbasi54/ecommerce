import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// PUT /api/users/addresses/:id
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { id } = await params;
    const { label, street, city, province, postalCode, country, isDefault } = await request.json();

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }
    if (address.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this address' },
        { status: 403 }
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(street && { street }),
        ...(city && { city }),
        ...(province && { province }),
        ...(postalCode && { postalCode }),
        ...(country && { country }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in updateAddress:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/addresses/:id
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    const { id } = await params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }
    if (address.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this address' },
        { status: 403 }
      );
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in deleteAddress:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
