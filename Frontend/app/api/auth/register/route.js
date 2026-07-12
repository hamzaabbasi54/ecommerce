import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateToken, getCookieOptions } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is too short"),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role } = validationResult.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

    const token = generateToken(user.id, user.role);
    const cookieOptions = getCookieOptions();

    const response = NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set('token', token, cookieOptions);
    return response;
  } catch (error) {
    console.error('Error in register route:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
