import prisma from '@/lib/prisma';
import OrderList from '@/components/admin/orders/OrderList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Orders | Admin',
};

export default async function AdminOrdersPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = q ? {
    OR: [
      { id: { contains: q, mode: 'insensitive' } },
      { contactEmail: { contains: q, mode: 'insensitive' } },
      { contactPhone: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } }
    ]
  } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } }
        }
      }
    }
  }),
    prisma.order.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders and update their fulfillment status.</p>
      </div>

      <OrderList initialOrders={orders} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
