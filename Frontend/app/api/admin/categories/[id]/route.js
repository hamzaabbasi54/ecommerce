import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// PUT /api/admin/categories/:id
export async function PUT(request, { params }) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name');
    const parentId = formData.get('parentId');

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category || category.deletedAt) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    if (parentId) {
      if (parentId === id) {
        return NextResponse.json({ success: false, message: 'A category cannot be its own parent' }, { status: 400 });
      }
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent || parent.deletedAt) {
        return NextResponse.json({ success: false, message: 'Parent category not found' }, { status: 404 });
      }
    }

    let slug;
    if (name && name !== category.name) {
      slug = generateSlug(name);
      const existingSlug = await prisma.category.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) slug = `${slug}-${Date.now()}`;
    }

    const imageFile = formData.get('image');
    const image = imageFile instanceof File ? await saveUploadedFile(imageFile, 'categories') : undefined;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(image && { image }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Category updated successfully', data: updatedCategory });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in updateCategory:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/:id (Soft Delete)
export async function DELETE(request, { params }) {
  try {
    await verifyAdmin(request);
    const { id } = await params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category || category.deletedAt) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in deleteCategory:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
