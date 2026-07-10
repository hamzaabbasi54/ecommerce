import prisma from '@/lib/prisma';
import ProductList from '@/components/admin/products/ProductList';

export const metadata = {
  title: 'Manage Products | Admin',
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
        <p className="text-muted-foreground mt-2">Manage your inventory, pricing, and stock.</p>
      </div>

      <ProductList initialProducts={products} />
    </div>
  );
}
