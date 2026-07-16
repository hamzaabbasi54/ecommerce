"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, ExternalLink } from 'lucide-react';
import useAuthStore from '@/context/useAuthStore';
import { Button } from '@/components/ui/button';

export default function AdminHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Logo */}
      <Link href="/admin" className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          Electronica<span className="text-blue-400">.</span>
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest border border-slate-700 rounded px-2 py-0.5">
          Admin
        </span>
      </Link>

      {/* Right: User Info + Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <Link
          href="/"
          className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
