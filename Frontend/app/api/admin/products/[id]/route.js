import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFiles } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// PUT /api/admin/products/:id
export async function PUT(request, { params }) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const discountPrice = formData.get('discountPrice');
    const stock = formData.get('stock');
    const categoryId = formData.get('categoryId');
    const brandId = formData.get('brandId');
    const isActive = formData.get('isActive');

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    if (brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    let slug;
    if (name && name !== product.name) {
      slug = generateSlug(name);
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) slug = `${slug}-${Date.now()}`;
    }

    let images = [...product.images];
    
    const existingImages = formData.getAll('existingImages');
    if (existingImages.length > 0) {
      images = existingImages;
    }

    const thumbnailFile = formData.get('thumbnail');
    const galleryFiles = formData.getAll('gallery').filter((f) => f instanceof File);

    if (thumbnailFile instanceof File || galleryFiles.length > 0) {
      const allNewFiles = [];
      if (thumbnailFile instanceof File) allNewFiles.push(thumbnailFile);
      allNewFiles.push(...galleryFiles);

      const newUrls = await saveUploadedFiles(allNewFiles, 'products');
      images = newUrls; // Replace entirely since UI uploads new to replace
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(discountPrice !== undefined && { discountPrice: discountPrice ? parseFloat(discountPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId && { categoryId }),
        ...(brandId && { brandId }),
        ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
        images,
      },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in updateProduct:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/products/:id (Soft Delete)
export async function DELETE(request, { params }) {
  try {
    await verifyAdmin(request);
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in deleteProduct:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
