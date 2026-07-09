import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// POST /api/admin/brands
export async function POST(request) {
  try {
    await verifyAdmin(request);
    const formData = await request.formData();

    const name = formData.get('name');
    const description = formData.get('description');

    if (!name) {
      return NextResponse.json({ success: false, message: 'Brand name is required' }, { status: 400 });
    }

    const existingBrand = await prisma.brand.findUnique({ where: { name } });
    if (existingBrand) {
      return NextResponse.json({ success: false, message: 'Brand with this name already exists' }, { status: 409 });
    }

    let slug = generateSlug(name);
    const existingSlug = await prisma.brand.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    const logoFile = formData.get('logo');
    const logo = logoFile instanceof File ? await saveUploadedFile(logoFile, 'brands') : null;

    const brand = await prisma.brand.create({
      data: { name, slug, logo, description: description || null },
    });

    return NextResponse.json(
      { success: true, message: 'Brand created successfully', data: brand },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error in createBrand:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
