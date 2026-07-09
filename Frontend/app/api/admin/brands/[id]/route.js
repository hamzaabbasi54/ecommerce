import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// PUT /api/admin/brands/:id
export async function PUT(request, { params }) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name');
    const description = formData.get('description');

    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    if (name && name !== brand.name) {
      const existingBrand = await prisma.brand.findUnique({ where: { name } });
      if (existingBrand) {
        return NextResponse.json({ success: false, message: 'Brand with this name already exists' }, { status: 409 });
      }
    }

    let slug;
    if (name && name !== brand.name) {
      slug = generateSlug(name);
      const existingSlug = await prisma.brand.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) slug = `${slug}-${Date.now()}`;
    }

    const logoFile = formData.get('logo');
    const logo = logoFile instanceof File ? await saveUploadedFile(logoFile, 'brands') : undefined;

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(logo && { logo }),
        ...(description !== undefined && { description: description || null }),
      },
    });

    return NextResponse.json({ success: true, message: 'Brand updated successfully', data: updatedBrand });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in updateBrand:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/brands/:id (Hard Delete)
export async function DELETE(request, { params }) {
  try {
    await verifyAdmin(request);
    const { id } = await params;

    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete brand. ${productCount} product(s) are still linked to it. Remove or reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in deleteBrand:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
