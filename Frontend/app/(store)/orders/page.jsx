import OrderHistoryClient from '@/components/orders/OrderHistoryClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login?redirect=/orders');
  }

  return <OrderHistoryClient />;
}
