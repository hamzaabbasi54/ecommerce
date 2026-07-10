import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// PUT /api/admin/categories/[id]
export async function PUT(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;
    
    const formData = await request.formData();
    const name = formData.get('name');
    const parentId = formData.get('parentId');

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const updateData = {};

    if (name && name !== category.name) {
      updateData.name = name;
      let slug = generateSlug(name);
      const existingSlug = await prisma.category.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }

    if (parentId !== undefined) {
      if (parentId === id) {
        return NextResponse.json({ success: false, message: 'Cannot set category as its own parent' }, { status: 400 });
      }
      if (parentId) {
        const parent = await prisma.category.findUnique({ where: { id: parentId } });
        if (!parent || parent.deletedAt) {
          return NextResponse.json({ success: false, message: 'Parent category not found' }, { status: 404 });
        }
      }
      updateData.parentId = parentId || null;
    }

    const imageFile = formData.get('image');
    if (imageFile instanceof File) {
      updateData.image = await saveUploadedFile(imageFile, 'categories');
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Category updated', data: updatedCategory });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error updating category:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request, props) {
  try {
    const params = await props.params;
    await verifyAdmin(request);
    const { id } = params;

    const category = await prisma.category.findUnique({ 
      where: { id },
      include: { children: true, products: true }
    });
    
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    if (category.children.length > 0 || category.products.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot delete category that has subcategories or products. Please delete or reassign them first.' 
      }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error deleting category:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
