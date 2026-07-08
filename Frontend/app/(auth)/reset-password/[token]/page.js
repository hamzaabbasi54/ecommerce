'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { resetPassword } from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Zod schema for reset password validation
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Please confirm your new password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams(); // Retrieves [token] from the URL
  const resetToken = params?.token;
  
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!resetToken) {
      setApiError('Invalid or missing reset token.');
      return;
    }

    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await resetPassword(resetToken, { password: data.password });
      if (response.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        
        // Wait briefly so they can read the success message
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center p-4 md:p-10 font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Reset Password Card */}
      <main className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-lg p-8 md:p-12 flex flex-col gap-8 tech-shadow">
        
        {/* Header */}
        <header className="text-center flex flex-col gap-2">
          <h1 className="font-h3 text-h3 text-on-surface">Reset Password</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your new password below to regain access to your account.
          </p>
        </header>

        {/* Messages */}
        {apiError && (
          <div className="p-4 bg-error-container text-on-error-container rounded-md text-sm border border-error/20">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-100 text-green-800 rounded-md text-sm border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          <Input 
            label="New Password"
            id="password"
            type="password"
            placeholder="Enter new password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input 
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              RESET PASSWORD
            </Button>
          </div>
        </form>

        {/* Back to Login Link */}
        <div className="text-center mt-2">
          <Link 
            href="/login" 
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Back to Login
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          © 2026 Electronica. Engineered Excellence.
        </p>
      </footer>

    </div>
  );
}
