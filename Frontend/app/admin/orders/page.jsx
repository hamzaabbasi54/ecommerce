import prisma from '@/lib/prisma';
import OrderList from '@/components/admin/orders/OrderList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Orders | Admin',
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } }
        }
      }
    }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders and update their fulfillment status.</p>
      </div>

      <OrderList initialOrders={orders} />
    </div>
  );
}
