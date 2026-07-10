import prisma from '@/lib/prisma';
import CategoryList from '@/components/admin/categories/CategoryList';

export const metadata = {
  title: 'Manage Categories | Admin',
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      parent: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-2">Manage product categories and subcategories.</p>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  );
}
