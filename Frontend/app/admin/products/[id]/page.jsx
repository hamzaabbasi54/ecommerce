import prisma from '@/lib/prisma';
import ProductForm from '@/components/admin/products/ProductForm';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Product | Admin',
};

export default async function EditProductPage(props) {
  const params = await props.params;
  const { id } = params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="animate-in fade-in duration-500">
      <ProductForm initialData={product} categories={categories} brands={brands} />
    </div>
  );
}
