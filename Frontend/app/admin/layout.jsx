import AdminProtect from '@/components/admin/AdminProtect';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Electronica',
  description: 'Manage the Electronica platform.',
};

export default function AdminLayout({ children }) {
  return (
    <AdminProtect>
      <div className="min-h-screen bg-[#0f172a]">
        <AdminHeader />
        <div className="flex min-h-[calc(100vh-4rem)]">
          <AdminSidebar />
          <main className="flex-1 w-full bg-slate-50">
            <div className="h-full w-full max-w-6xl mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProtect>
  );
}
