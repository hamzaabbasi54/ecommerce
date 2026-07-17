"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/context/useAuthStore';

export default function AdminProtect({ children }) {
  const { user, isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Initialize auth state if missing
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        await initialize();
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [initialize, user]);

  // Handle redirects based on auth status
  useEffect(() => {
    if (!isChecking) {
      if (!isAuthenticated || !user) {
        router.replace('/login?redirect=/admin');
      } else if (user.role !== 'ADMIN') {
        router.replace('/');
      }
    }
  }, [isChecking, isAuthenticated, user, router]);

  // Show loading spinner while checking or redirecting
  if (isChecking || !isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-400">sync</span>
      </div>
    );
  }

  return <>{children}</>;
}
