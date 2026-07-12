"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/context/useAuthStore';

export default function AdminProtect({ children }) {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.replace('/login?redirect=/admin');
      } else if (user.role !== 'ADMIN') {
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  return <>{children}</>;
}
