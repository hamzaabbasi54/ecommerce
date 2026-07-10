import prisma from '@/lib/prisma';
import UserList from '@/components/admin/users/UserList';

export const metadata = {
  title: 'Manage Users | Admin',
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isVerified: true,
      profileImage: true,
      createdAt: true,
      _count: {
        select: { orders: true, reviews: true }
      }
    }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
        <p className="text-muted-foreground mt-2">Manage customer accounts and administrative roles.</p>
      </div>

      <UserList initialUsers={users} />
    </div>
  );
}
