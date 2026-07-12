'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { forgotPassword } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPasswordForm() {
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
    <div className="w-full max-w-[480px]">
      <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold mb-2">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Messages */}
        {apiError && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="uppercase text-xs tracking-wider text-muted-foreground font-semibold">Email Address</Label>
            <Input 
              id="email"
              type="email"
              placeholder="name@example.com"
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-11 text-base font-medium uppercase tracking-wider" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>

        {/* Back to Login */}
        <div className="mt-10 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
