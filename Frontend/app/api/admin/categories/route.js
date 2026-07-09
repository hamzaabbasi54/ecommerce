import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// POST /api/admin/categories
export async function POST(request) {
  try {
    await verifyAdmin(request);
    const formData = await request.formData();

    const name = formData.get('name');
    const parentId = formData.get('parentId');

    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent || parent.deletedAt) {
        return NextResponse.json({ success: false, message: 'Parent category not found' }, { status: 404 });
      }
    }

    let slug = generateSlug(name);
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    const imageFile = formData.get('image');
    const image = imageFile instanceof File ? await saveUploadedFile(imageFile, 'categories') : null;

    const category = await prisma.category.create({
      data: { name, slug, image, parentId: parentId || null },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Category created successfully', data: category },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in createCategory:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
