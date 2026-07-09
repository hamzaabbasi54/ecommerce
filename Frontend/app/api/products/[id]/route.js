import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || product.deletedAt) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
