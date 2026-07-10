"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/context/useAuthStore';

export default function AdminProtect({ children }) {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.replace('/login?redirect=/admin');
      } else if (user.role !== 'ADMIN') {
        router.replace('/');
      } else {
        setIsChecking(false);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  return <>{children}</>;
}
