import prisma from '@/lib/prisma';
import ProductList from '@/components/admin/products/ProductList';

export const metadata = {
  title: 'Manage Products | Admin',
};

export default async function AdminProductsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } }
      ]
    } : {})
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
        <p className="text-muted-foreground mt-2">Manage your inventory, pricing, and stock.</p>
      </div>

      <ProductList initialProducts={products} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
