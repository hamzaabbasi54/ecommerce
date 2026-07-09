import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null, parentId: null },
      include: {
        children: {
          where: { deletedAt: null },
          select: {
            id: true, name: true, slug: true, image: true,
            children: {
              where: { deletedAt: null },
              select: { id: true, name: true, slug: true, image: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error in getCategories:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
