import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Brands fetched successfully',
      data: brands,
    });
  } catch (error) {
    console.error('Error in getBrands:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
