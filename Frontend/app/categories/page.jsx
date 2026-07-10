import prisma from '@/lib/prisma';
import CategoryCard from '@/components/categories/CategoryCard';
import Link from 'next/link';

export const metadata = {
  title: 'Shop by Category | Electronica',
  description: 'Precision-engineered hardware for every workflow.',
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' }
  });

  return (
    <main className="flex-grow flex flex-col w-full min-h-[70vh]">
      {/* Header Section */}
      <section className="py-16 md:py-24 px-4 md:px-10 max-w-[1280px] mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Shop by Category
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Precision-engineered hardware for every workflow.
        </p>
      </section>

      {/* Category Grid */}
      <section className="px-4 md:px-10 pb-24 max-w-[1280px] w-full mx-auto">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                className="animate-in fade-in zoom-in-95 fill-mode-both"
                style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
              >
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground animate-in fade-in">
            <p className="text-lg">No categories found.</p>
            <Link href="/products" className="text-primary hover:underline font-medium mt-4 inline-block">
              Shop All Products instead
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
