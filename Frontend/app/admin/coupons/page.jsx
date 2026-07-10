import prisma from '@/lib/prisma';
import CouponList from '@/components/admin/coupons/CouponList';

export const metadata = {
  title: 'Manage Coupons | Admin',
};

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Coupons</h1>
        <p className="text-muted-foreground mt-2">Manage discount codes and promotional offers.</p>
      </div>

      <CouponList initialCoupons={coupons} />
    </div>
  );
}
