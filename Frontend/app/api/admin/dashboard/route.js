import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    // Authenticate and verify admin role
    const user = await verifyAdmin(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run aggregate queries in parallel
    const [totalUsers, totalProducts, totalOrders, revenueData, recentSales, ordersLast30] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }), // Only count regular users
      prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          status: {
            notIn: ['cancelled', 'returned']
          }
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          items: {
            include: { product: { select: { name: true } } },
            take: 1
          }
        }
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['cancelled', 'returned'] }
        },
        select: {
          createdAt: true,
          total: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Group orders by day
    const chartDataMap = {};
    for (let i = 0; i <= 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      chartDataMap[dateStr] = { date: d.getDate().toString(), revenue: 0, orders: 0 };
    }

    ordersLast30.forEach(order => {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (chartDataMap[dateStr]) {
        chartDataMap[dateStr].revenue += order.total;
        chartDataMap[dateStr].orders += 1;
      }
    });

    const stats = {
      users: totalUsers,
      products: totalProducts,
      orders: totalOrders,
      revenue: revenueData._sum.total || 0,
      recentSales: recentSales.map(s => ({
        id: s.id,
        customerName: s.user.name,
        product: s.items[0]?.product?.name || 'Multiple Items',
        date: s.createdAt,
        amount: s.total
      })),
      chartData: Object.values(chartDataMap)
    };

    return NextResponse.json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Check if it's an unauthorized response thrown by verifyAdmin
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
