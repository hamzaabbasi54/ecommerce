import OrderDetailClient from '@/components/orders/OrderDetailClient';

export default async function OrderDetailPage({ params }) {
  const resolvedParams = await params;
  return <OrderDetailClient orderId={resolvedParams.id} />;
}
