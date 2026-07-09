import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFiles } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// POST /api/admin/products
export async function POST(request) {
  try {
    const user = await verifyAdmin(request);
    const formData = await request.formData();

    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const discountPrice = formData.get('discountPrice');
    const stock = formData.get('stock');
    const categoryId = formData.get('categoryId');
    const brandId = formData.get('brandId');

    if (!name || !price || !stock || !categoryId || !brandId) {
      return NextResponse.json(
        { success: false, message: 'Name, price, stock, categoryId, and brandId are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    let slug = generateSlug(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    // Handle multiple image uploads
    const imageFiles = formData.getAll('images').filter((f) => f instanceof File);
    const images = imageFiles.length > 0 ? await saveUploadedFiles(imageFiles, 'products') : [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock),
        images,
        categoryId,
        brandId,
      },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: product },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in createProduct:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
