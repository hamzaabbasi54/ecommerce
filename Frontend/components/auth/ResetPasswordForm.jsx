'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { resetPassword } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Please confirm your new password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useParams();
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
    <div className="w-full max-w-md flex flex-col gap-8">
      <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-8 md:p-12 flex flex-col gap-8">
        
        {/* Header */}
        <header className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below to regain access to your account.
          </p>
        </header>

        {/* Messages */}
        {apiError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password"
              type="password"
              placeholder="Enter new password"
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('password')}
            />
            {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-11 text-base font-medium uppercase tracking-wider" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>

        {/* Back to Login Link */}
        <div className="text-center mt-2">
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Electronica. Engineered Excellence.
        </p>
      </footer>
    </div>
  );
}
