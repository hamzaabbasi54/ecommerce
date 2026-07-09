import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import sendEmail from '@/lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token and save to database
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 3. Set expiry to 10 minutes from now
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken,
        resetPasswordExpire,
      },
    });

    // 4. Build the reset URL and email HTML
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background-color:#4F46E5; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
        Reset Password
      </a>
      <p style="margin-top:16px; color:#666;">This link will expire in <strong>10 minutes</strong>.</p>
      <p style="color:#999;">If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html,
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      // If email fails, rollback: clear the token from DB
      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: null,
          resetPasswordExpire: null,
        },
      });
      console.error('Email sending failed:', emailError.message);
      return NextResponse.json(
        { success: false, message: 'Email could not be sent' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
