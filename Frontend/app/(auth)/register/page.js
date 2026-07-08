'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { register as registerService } from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Zod schema for registration validation
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(5, 'Please enter a valid phone number.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Please confirm your password.')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // set the path of the error
});

export default function RegisterPage() {
  const router = useRouter();
  
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      // We pass name as fullName based on our Zod schema. 
      // The backend expects { name, email, password, phone }
      const response = await registerService({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (response.success) {
        // As requested by user: redirect to login page after successful registration
        router.push('/login');
      }
    } catch (error) {
      // Due to our centralized Axios interceptor, error is now always a standard JS Error
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4 md:p-10 font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-[480px] flex flex-col items-center">
        
        {/* Brand / Header */}
        <div className="mb-12 text-center w-full">
          <h1 className="font-h1 text-h1 text-on-surface mb-2 tracking-tighter">Electronica</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Create your account.</p>
        </div>

        {/* Registration Card */}
        <div className="bg-surface-container-lowest w-full border border-outline-variant p-8 md:p-12 rounded-lg tech-shadow">
          
          {apiError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-md text-sm border border-error/20">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <Input 
              label="Full Name"
              id="fullName"
              type="text"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input 
              label="Email Address"
              id="email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input 
              label="Phone Number"
              id="phone"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input 
              label="Password"
              id="password"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input 
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                CREATE ACCOUNT
              </Button>
            </div>
          </form>
        </div>

        {/* Secondary Action */}
        <div className="mt-8 text-center w-full">
          <Link href="/login" className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container hover:underline transition-colors duration-200">
            Already have an account? Log in
          </Link>
        </div>

      </main>
    </div>
  );
}
