import prisma from '@/lib/prisma';
import UserList from '@/components/admin/users/UserList';

export const metadata = {
  title: 'Manage Users | Admin',
};

export default async function AdminUsersPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } }
    ]
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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
  }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
        <p className="text-muted-foreground mt-2">Manage customer accounts and administrative roles.</p>
      </div>

      <UserList initialUsers={users} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
