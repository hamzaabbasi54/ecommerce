'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(loginSchema),});

  const onSubmit = async (data) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      const response = await login(data);
      if (response.success) {
        setUser(response.data);
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
            <div className="relative">
              <Input 
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
