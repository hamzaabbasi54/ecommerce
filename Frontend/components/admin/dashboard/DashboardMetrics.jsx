"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import RecentSalesTable from './RecentSalesTable';

export default function DashboardMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard', { withCredentials: true });
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse bg-surface-container-low border-border h-32"></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          <div className="animate-pulse bg-surface-container-low border-border rounded-xl"></div>
          <div className="animate-pulse bg-surface-container-low border-border rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 text-error rounded-md border border-error/20">
        {error}
      </div>
    );
  }

  const metricCards = [
    { title: 'TOTAL REVENUE', value: `$${data?.revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'TOTAL ORDERS', value: data?.orders || 0, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'TOTAL USERS', value: data?.users || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'ACTIVE PRODUCTS', value: data?.products || 0, icon: Package, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-surface-container-lowest border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className={`p-3 rounded-2xl ${metric.bg}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <PerformanceChart data={data?.chartData} />
        <RecentSalesTable sales={data?.recentSales} />
      </div>
    </div>
  );
}
