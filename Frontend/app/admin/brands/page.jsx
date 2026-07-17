import prisma from '@/lib/prisma';
import BrandList from '@/components/admin/brands/BrandList';

export const metadata = {
  title: 'Manage Brands | Admin',
};

export default async function AdminBrandsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = q ? {
    name: { contains: q, mode: 'insensitive' }
  } : {};

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.brand.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Brands</h1>
        <p className="text-muted-foreground mt-2">Manage product brands and their logos.</p>
      </div>

      <BrandList initialBrands={brands} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
