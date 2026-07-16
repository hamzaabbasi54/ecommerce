'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

import { register as registerService } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(5, 'Please enter a valid phone number.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Please confirm your password.')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export default function RegisterForm() {
  const router = useRouter();
  
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit,formState: { errors }, } = useForm({  resolver: zodResolver(registerSchema),});

  const onSubmit = async (data) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      const response = await registerService({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (response.success) {
        router.push('/login');
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      {/* Back Button */}
      <div className="mb-6 flex justify-center">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Homepage
          </Link>
        </Button>
      </div>

      {/* Brand / Header */}
      <div className="text-center mb-12">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <h1 className="text-3xl font-bold tracking-tighter text-primary mb-2">Electronica</h1>
        </Link>
        <p className="text-muted-foreground">Create your account.</p>
      </div>

      {/* Registration Card */}
      <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-8 md:p-12">
        
        {apiError && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              type="text"
              placeholder="John Doe"
              className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('fullName')}
            />
            {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email"
              type="email"
              placeholder="name@example.com"
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('email')}
            />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register('phone')}
            />
            {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
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
            {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>

        {/* Secondary Action */}
        <div className="mt-8 text-center pt-4 border-t">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Already have an account? <span className="text-primary font-medium hover:underline">Log in</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
