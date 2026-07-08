'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { login } from '@/services/authService';
import useAuthStore from '@/context/useAuthStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// 1. Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  // API error state
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. React Hook Form setup
  const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(loginSchema), });

  // 3. Form submission handler
  const onSubmit = async (data) => { 
    setApiError(null);
    setIsSubmitting(true);

    try {
      // Call our authService, which hits the backend via axiosInstance
      const response = await login(data);
      
      // On success: save the user to our global store
      if (response.success) {
        setUser(response.user);

        // Redirect based on role
        if (response.user.role === 'ADMIN') {
          router.push('/'); // As requested: admin goes to / after login
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      // Due to our centralized Axios interceptor, error is now always a standard JS Error
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center px-4 md:px-10 font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-[440px]">
        
        {/* Brand / Header */}
        <div className="text-center mb-12">
          <h1 className="font-h3 text-h3 tracking-tighter text-primary">Electronica</h1>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg tech-shadow p-8 md:p-10">
          <h2 className="font-h2 text-h2 mb-8 text-on-surface">Log In</h2>
          
          {/* Global API Error Display */}
          {apiError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-md text-sm border border-error/20">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Input */}
            <Input 
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Input */}
            <Input 
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Primary Button */}
            <div className="pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                Log In
              </Button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link href="/forgot-password" className="block font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200">
              Forgot Password?
            </Link>
            
            <div className="font-body-md text-body-md text-on-surface-variant pt-4 border-t border-outline-variant/30">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-container hover:text-primary hover:underline transition-colors duration-200 font-medium">
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
