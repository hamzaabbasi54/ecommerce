"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PerformanceChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Performance Overview</h2>
          <p className="text-sm text-muted-foreground">Sales and orders over the last 30 days</p>
        </div>
        <div className="text-sm text-muted-foreground font-medium">Last 30 days</div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
              tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`}
              width={55}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--surface-container-lowest))' }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              name="Revenue"
              stroke="#8b5cf6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              name="Orders"
              stroke="#1e3a8a" 
              strokeWidth={2}
              fill="transparent" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
