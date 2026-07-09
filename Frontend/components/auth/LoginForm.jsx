'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { login } from '@/services/authService';
import useAuthStore from '@/context/useAuthStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(loginSchema),});

  const onSubmit = async (data) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      const response = await login(data);
      if (response.success) {
        setUser(response.user);
        router.push('/');
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      {/* Brand / Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter text-primary">Electronica</h1>
      </div>

      {/* Login Card */}
      <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-8 md:p-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">Log In</h2>
        
        {/* Global API Error Display */}
        {apiError && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
              {isSubmitting ? "Logging In..." : "Log In"}
            </Button>
          </div>
        </form>

        {/* Links */}
        <div className="mt-8 text-center space-y-4">
          <Link href="/forgot-password" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            Forgot Password?
          </Link>
          
          <div className="text-sm text-muted-foreground pt-4 border-t">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
