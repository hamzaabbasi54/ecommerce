import prisma from '@/lib/prisma';
import CouponList from '@/components/admin/coupons/CouponList';

export const metadata = {
  title: 'Manage Coupons | Admin',
};

export default async function AdminCouponsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = q ? {
    code: { contains: q, mode: 'insensitive' }
  } : {};

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coupon.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Coupons</h1>
        <p className="text-muted-foreground mt-2">Manage discount codes and promotional offers.</p>
      </div>

      <CouponList initialCoupons={coupons} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
