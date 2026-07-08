'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { forgotPassword } from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Zod schema for forgot password validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email: data.email });
      if (response.success) {
        setSuccessMessage(response.message || 'Reset link sent to your email.');
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-10 bg-surface text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-[480px]">
        
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-8 md:p-12 tech-shadow">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-h3 text-h3 text-on-surface mb-2 tracking-tight">Forgot Password?</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Messages */}
          {apiError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-md text-sm border border-error/20">
              {apiError}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md text-sm border border-green-200">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input 
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                SEND RESET LINK
              </Button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-10 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
              Back to Login
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
