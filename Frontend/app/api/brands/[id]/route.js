import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/brands/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          where: { deletedAt: null, isActive: true },
          include: {
            category: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brand fetched successfully',
      data: brand,
    });
  } catch (error) {
    console.error('Error in getBrandById:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
