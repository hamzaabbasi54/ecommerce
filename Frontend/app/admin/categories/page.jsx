import prisma from '@/lib/prisma';
import CategoryList from '@/components/admin/categories/CategoryList';

export const metadata = {
  title: 'Manage Categories | Admin',
};

export default async function AdminCategoriesPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(q ? { name: { contains: q, mode: 'insensitive' } } : {})
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.category.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-2">Manage product categories and subcategories.</p>
      </div>

      <CategoryList initialCategories={categories} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
