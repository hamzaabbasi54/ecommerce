import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateToken, getCookieOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password, phone, role } = await request.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

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
