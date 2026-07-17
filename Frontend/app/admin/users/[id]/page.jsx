import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import UserDetailClient from '@/components/admin/users/UserDetailClient';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage(props) {
  const params = await props.params;
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      _count: {
        select: { orders: true, reviews: true }
      }
    }
  });

  if (!user) {
    redirect('/admin/users');
  }

  const orders = await prisma.order.findMany({
    where: { userId: id, status: { not: 'CANCELLED' } },
    select: { total: true }
  });
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const userData = { ...user, totalSpent };

  return <UserDetailClient initialUser={userData} />;
}
