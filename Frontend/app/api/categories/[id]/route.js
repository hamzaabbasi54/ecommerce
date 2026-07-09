import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true, image: true },
        },
        products: {
          where: { deletedAt: null, isActive: true },
          include: {
            brand: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category || category.deletedAt) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error in getCategoryById:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
