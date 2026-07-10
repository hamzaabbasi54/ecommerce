import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// PUT /api/admin/brands/[id]
export async function PUT(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;
    
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');

    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    const updateData = { description: description || null };

    if (name && name !== brand.name) {
      updateData.name = name;
      let slug = generateSlug(name);
      const existingSlug = await prisma.brand.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }

    const logoFile = formData.get('logo');
    if (logoFile instanceof File) {
      updateData.logo = await saveUploadedFile(logoFile, 'brands');
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Brand updated', data: updatedBrand });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error updating brand:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/brands/[id]
export async function DELETE(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;

    const brand = await prisma.brand.findUnique({ 
      where: { id },
      include: { products: true }
    });
    
    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    if (brand.products.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot delete brand that has products. Please delete or reassign them first.' 
      }, { status: 400 });
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error deleting brand:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
