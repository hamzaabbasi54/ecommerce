import prisma from '@/lib/prisma';
import ProductForm from '@/components/admin/products/ProductForm';

export const metadata = {
  title: 'Add New Product | Admin',
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="animate-in fade-in duration-500">
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
