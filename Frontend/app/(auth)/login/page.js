'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { login } from '@/services/authService';
import useAuthStore from '@/context/useAuthStore';

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
      // On failure: capture and display the backend message
      setApiError(
        error.response?.data?.message || error.message || 'Login failed. Please try again.'
      );
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
            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <input 
                {...register('email')}
                className={`w-full h-12 px-4 bg-surface-container-lowest border ${errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary-container focus:border-primary-container'} rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 transition-colors duration-200`}
                id="email" 
                type="email" 
                placeholder="name@example.com" 
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <input 
                {...register('password')}
                className={`w-full h-12 px-4 bg-surface-container-lowest border ${errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary-container focus:border-primary-container'} rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 transition-colors duration-200`}
                id="password" 
                type="password" 
                placeholder="••••••••" 
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Primary Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-primary-container text-on-primary-container font-button text-button rounded-lg hover:bg-primary transition-colors duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'LOGGING IN...' : 'LOG IN'}
            </button>
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
