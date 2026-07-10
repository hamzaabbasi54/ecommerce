import DashboardMetrics from '@/components/admin/dashboard/DashboardMetrics';

export const metadata = {
  title: 'Admin Dashboard | Electronica',
  description: 'Overview of the Electronica platform.',
};

export default function AdminDashboardPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here is an overview of your store.</p>
      </div>

      <DashboardMetrics />
    </div>
  );
}
