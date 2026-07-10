import prisma from '@/lib/prisma';
import BrandList from '@/components/admin/brands/BrandList';

export const metadata = {
  title: 'Manage Brands | Admin',
};

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Brands</h1>
        <p className="text-muted-foreground mt-2">Manage product brands and their logos.</p>
      </div>

      <BrandList initialBrands={brands} />
    </div>
  );
}
